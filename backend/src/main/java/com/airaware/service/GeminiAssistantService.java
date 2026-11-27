package com.airaware.service;

import com.airaware.dto.*;
import com.airaware.model.AirQualityData;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiAssistantService {
    private static final Logger log = LoggerFactory.getLogger(GeminiAssistantService.class);

    @Value("${airaware.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${airaware.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final DeterministicRecommendationEngine deterministicEngine;
    private final AirQualityService airQualityService;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiAssistantService(DeterministicRecommendationEngine deterministicEngine,
                                  @Lazy AirQualityService airQualityService,
                                  ObjectMapper objectMapper) {
        this.deterministicEngine = deterministicEngine;
        this.airQualityService = airQualityService;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder().build();
    }

    public DailyPlanResponse getPersonalizedDailyPlan(DailyPlanRequest request) {
        DailyPlanResponse basePlan = deterministicEngine.generatePlan(request);
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                String prompt = buildPromptForPlan(request, basePlan);
                String geminiText = callGemini(prompt);
                if (geminiText != null && !geminiText.trim().isEmpty()) {
                    basePlan.setDailySummary(cleanGeminiText(geminiText));
                }
            } catch (Exception e) {
                log.warn("Gemini call failed; using deterministic baseline: {}", e.getMessage());
            }
        }
        return basePlan;
    }

    public ChatResponse handleChat(ChatRequest request) {
        String userMsg = request.getMessage();

        // 1. Detect any specific target locations mentioned in the conversation query
        List<String> detectedLocations = detectLocationsInQuery(userMsg);
        StringBuilder multiLocationContext = new StringBuilder();
        List<ChatResponse.ActionPill> pills = new ArrayList<>();

        if (!detectedLocations.isEmpty()) {
            for (String locName : detectedLocations) {
                List<Map<String, Object>> search = airQualityService.searchLocations(locName);
                if (!search.isEmpty()) {
                    Map<String, Object> first = search.get(0);
                    double lat = ((Number) first.get("latitude")).doubleValue();
                    double lng = ((Number) first.get("longitude")).doubleValue();
                    String resolvedName = (String) first.get("name");
                    AirQualityData data = airQualityService.getCurrentAirQuality(lat, lng);
                    
                    multiLocationContext.append(String.format(
                            "\n• %s (Coordinates: %.4f, %.4f): AQI %d (%s), Dominant: %s, PM2.5: %.1f µg/m³, Summary: %s",
                            resolvedName, lat, lng, data.getAqi(), data.getCategory(), data.getDominantPollutant(),
                            data.getPollutants().containsKey("PM2.5") ? data.getPollutants().get("PM2.5").getValue() : 0.0,
                            data.getSummary()
                    ));
                    pills.add(new ChatResponse.ActionPill("Switch to " + resolvedName, "switch_location"));
                }
            }
        }

        // 2. Active exact location context
        String activeLoc = request.getLocationName() != null ? request.getLocationName() : "Selected Landmark";
        double activeLat = request.getLatitude() != 0.0 ? request.getLatitude() : 19.2183;
        double activeLng = request.getLongitude() != 0.0 ? request.getLongitude() : 72.9780;
        int aqi = request.getCurrentAqi() > 0 ? request.getCurrentAqi() : 114;
        String pollutant = request.getDominantPollutant() != null ? request.getDominantPollutant() : "PM2.5";
        String category = SimulatedAirQualityProvider.getCategoryForAqi(aqi);

        pills.add(new ChatResponse.ActionPill("View Daily Routine Planner", "switch_view"));
        pills.add(new ChatResponse.ActionPill("Check Indoor Recommendations", "switch_view"));

        // 3. Call Gemini with strict location precision instructions
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                String systemContext = String.format(
                        "You are AirAware AI, an expert environmental wellness companion with strict geographical accuracy.\n\n" +
                        "PRIMARY LOCATION CONTEXT:\n" +
                        "- Selected Exact Location: %s\n" +
                        "- Geographic Coordinates: %.4f° N, %.4f° E\n" +
                        "- Current Measured AQI: %d (%s)\n" +
                        "- Dominant Pollutant: %s\n" +
                        "- Household Profiles: %s\n" +
                        "- Solution Budget: %s\n" +
                        (multiLocationContext.length() > 0 ? ("\nREAL-TIME DATA FOR QUERIED LOCATIONS:" + multiLocationContext) : "") +
                        "\n\nSTRICT GEOGRAPHIC & SAFETY RULES:\n" +
                        "1. ALWAYS refer specifically to the exact location '%s' requested by the user. NEVER substitute with a broader parent city (e.g. if the user is at Upvan Lake, Thane, do NOT say 'In Mumbai...').\n" +
                        "2. If the user asks about Upvan Lake or any specific park/lake/suburb, explain that environmental readings correspond to the atmospheric model for those exact coordinates.\n" +
                        "3. Rely strictly on measured telemetry. Never invent AQI numbers or PM values.\n" +
                        "4. If multiple locations are compared, highlight the difference in AQI and particulate density.\n" +
                        "5. Provide practical, health-protective guidance without clinical medical diagnosis.\n\n" +
                        "User query: %s",
                        activeLoc, activeLat, activeLng, aqi, category, pollutant,
                        request.getHouseholdProfiles() != null ? request.getHouseholdProfiles().toString() : "Standard",
                        request.getBudgetPreference() != null ? request.getBudgetPreference() : "No-cost",
                        activeLoc,
                        userMsg
                );

                String aiReply = callGemini(systemContext);
                if (aiReply != null && !aiReply.trim().isEmpty()) {
                    return new ChatResponse(
                            aiReply,
                            Arrays.asList("When is the best workout window?", "How to reduce PM2.5 in bedroom?", "Is outdoor running safe?"),
                            pills,
                            "AirAware recommendations are grounded in physical environmental telemetry. For acute clinical symptoms, consult a doctor."
                    );
                }
            } catch (Exception e) {
                log.warn("Gemini call fallback: {}", e.getMessage());
            }
        }

        // Smart location-precise fallback reply
        String reply;
        if (multiLocationContext.length() > 0) {
            reply = String.format(
                    "Here is the verified real-time air quality observation for the location(s) requested:\n%s\n\nCompared to your active location (%s - AQI %d, %s), consider the exposure difference before planning outdoor activities or travel.",
                    multiLocationContext.toString(), activeLoc, aqi, category
            );
        } else {
            reply = generatePreciseFallbackReply(userMsg, aqi, category, pollutant, activeLoc);
        }

        return new ChatResponse(
                reply,
                Arrays.asList("Compare air with nearby station", "Is it safe for children outside?", "Should I open windows?"),
                pills,
                "AirAware provides environmental intelligence. Consult medical specialists for clinical health advice."
        );
    }

    private List<String> detectLocationsInQuery(String query) {
        List<String> found = new ArrayList<>();
        if (query == null) return found;

        Pattern p = Pattern.compile("\\b(?:in|at|for|around|about|near|compare)\\s+([a-zA-Z\\s]{3,25})(?:\\band\\b|\\bwith\\b|\\?|\\.|,|$)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(query);
        while (m.find()) {
            String candidate = sanitizeLocationName(m.group(1));
            if (!isStopWord(candidate) && !found.contains(candidate)) {
                found.add(candidate);
            }
        }

        Pattern pCompare = Pattern.compile("compare\\s+([a-zA-Z\\s]{3,20})\\s+(?:and|to|with)\\s+([a-zA-Z\\s]{3,20})", Pattern.CASE_INSENSITIVE);
        Matcher mComp = pCompare.matcher(query);
        if (mComp.find()) {
            String c1 = sanitizeLocationName(mComp.group(1));
            String c2 = sanitizeLocationName(mComp.group(2));
            if (!found.contains(c1) && !isStopWord(c1)) found.add(c1);
            if (!found.contains(c2) && !isStopWord(c2)) found.add(c2);
        }

        if (found.isEmpty() && query.trim().split("\\s+").length <= 4) {
            String clean = sanitizeLocationName(query.replaceAll("[?!.,]", ""));
            if (!isStopWord(clean) && clean.length() >= 3) {
                found.add(clean);
            }
        }

        return found;
    }

    private String sanitizeLocationName(String s) {
        if (s == null) return "";
        String clean = s.trim();
        clean = clean.replaceAll("(?i)\\b(right now|currently|today|yesterday|tomorrow|this evening|this morning|air quality|aqi|air|weather)\\b", "").trim();
        return clean;
    }

    private boolean isStopWord(String s) {
        String l = s.toLowerCase().trim();
        return l.isEmpty() || l.equals("the air") || l.equals("air") || l.equals("air quality") || l.equals("aqi") ||
                l.equals("today") || l.equals("now") || l.equals("my location") || l.equals("outside") ||
                l.equals("walk") || l.equals("run") || l.equals("home") || l.equals("office") ||
                l.equals("here") || l.equals("this place") || l.equals("morning") || l.equals("evening") ||
                l.equals("lake") || l.equals("park") || l.equals("station");
    }

    private String buildPromptForPlan(DailyPlanRequest req, DailyPlanResponse base) {
        return String.format(
                "You are AirAware, an environmental wellness intelligence companion. " +
                "Exact Selected Location: %s (Coordinates: %.4f, %.4f). Current Measured AQI: %d (%s). Dominant Pollutant: %s. " +
                "Household: %s. Budget: %s. " +
                "Write a 2-3 sentence personalized morning summary for %s. Address %s specifically. Avoid generic boilerplate or substituting another city.",
                req.getLocationName(), req.getLatitude(), req.getLongitude(), req.getCurrentAqi(),
                SimulatedAirQualityProvider.getCategoryForAqi(req.getCurrentAqi()),
                req.getDominantPollutant(), req.getHouseholdProfiles(), req.getBudgetPreference(),
                req.getLocationName(), req.getLocationName()
        );
    }

    private String callGemini(String prompt) {
        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        try {
            String responseStr = webClient.post()
                    .uri(endpoint)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseStr);
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
        } catch (Exception ex) {
            log.error("Error communicating with Gemini endpoint: {}", ex.getMessage());
        }
        return null;
    }

    private String cleanGeminiText(String text) {
        return text.replace("```json", "").replace("```", "").trim();
    }

    private String generatePreciseFallbackReply(String query, int aqi, String category, String pollutant, String location) {
        String lower = query.toLowerCase();
        if (lower.contains("walk") || lower.contains("run") || lower.contains("exercise") || lower.contains("outdoor")) {
            if (aqi <= 100) {
                return String.format("Around %s, outdoor activities are currently favorable with measured AQI at %d (%s). Morning strolls or lakeside jogs are safe with minimal pulmonary stress.", location, aqi, category);
            } else if (aqi <= 180) {
                return String.format("Around %s, outdoor exercise should be moderated today as AQI is %d (%s) with %s elevated. If planning cardio near %s, schedule it during the afternoon solar dispersion window (1:00 PM – 3:30 PM).", location, aqi, category, pollutant, location);
            } else {
                return String.format("For %s, we recommend moving vigorous workouts indoors today. The measured AQI is %d (%s) dominated by %s. Heavy aerobic breathing near roadways increases deep lung particulate deposition.", location, aqi, category, pollutant);
            }
        } else if (lower.contains("window") || lower.contains("ventilat")) {
            if (aqi <= 75) {
                return String.format("Good news for %s: ambient air is relatively fresh (AQI %d). Now is a suitable time to open windows for 20-30 minutes to displace indoor CO2.", location, aqi);
            } else {
                return String.format("Keep windows and balcony doors sealed around %s right now (AQI %d, %s). Early morning traffic and atmospheric inversion trap particulates near ground level.", location, aqi, category);
            }
        } else {
            return String.format("At %s, the current measured air quality index is %d (%s) with %s as the primary pollutant. Based on local atmospheric dispersion, prioritize indoor air management and plan outdoor errands during midday hours.", location, aqi, category, pollutant);
        }
    }
}
