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

        // Detect locations in query
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
                    AirQualityData data = airQualityService.getCurrentAirQuality(lat, lng);
                    multiLocationContext.append(String.format(
                            "\n• %s: AQI %d (%s), Dominant: %s, PM2.5: %.1f µg/m³, Summary: %s",
                            first.get("name"), data.getAqi(), data.getCategory(), data.getDominantPollutant(),
                            data.getPollutants().containsKey("PM2.5") ? data.getPollutants().get("PM2.5").getValue() : 0.0,
                            data.getSummary()
                    ));
                    pills.add(new ChatResponse.ActionPill("Switch to " + first.get("name"), "switch_location"));
                }
            }
        }

        // Current primary location context
        String activeLoc = request.getLocationName() != null ? request.getLocationName() : "Your active location";
        int aqi = request.getCurrentAqi() > 0 ? request.getCurrentAqi() : 145;
        String pollutant = request.getDominantPollutant() != null ? request.getDominantPollutant() : "PM2.5";
        String category = SimulatedAirQualityProvider.getCategoryForAqi(aqi);

        pills.add(new ChatResponse.ActionPill("View Daily Routine Planner", "switch_view"));
        pills.add(new ChatResponse.ActionPill("Check Indoor Recommendations", "switch_view"));

        // Call Gemini if key is provided
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            try {
                String systemContext = String.format(
                        "You are AirAware AI, an expert environmental wellness & air quality companion.\n" +
                        "Active Dashboard Location: %s\n" +
                        "Measured AQI: %d (%s), Dominant: %s\n" +
                        "Household Profiles: %s\n" +
                        "Budget: %s\n" +
                        (multiLocationContext.length() > 0 ? ("\nReal-time Data for Queried Locations:" + multiLocationContext) : "") +
                        "\n\nRules:\n" +
                        "1. Rely strictly on measured telemetry. Never fabricate numbers.\n" +
                        "2. If user asked about other cities/locations, answer directly with the real queried location data provided.\n" +
                        "3. Do not diagnose clinical diseases or give medical prescriptions.\n" +
                        "4. Keep response clear, informative and actionable.\n" +
                        "User query: %s",
                        activeLoc, aqi, category, pollutant,
                        request.getHouseholdProfiles() != null ? request.getHouseholdProfiles().toString() : "Standard",
                        request.getBudgetPreference() != null ? request.getBudgetPreference() : "No-cost",
                        userMsg
                );

                String aiReply = callGemini(systemContext);
                if (aiReply != null && !aiReply.trim().isEmpty()) {
                    return new ChatResponse(
                            aiReply,
                            Arrays.asList("When is the best workout window?", "How to reduce PM2.5 in bedroom?", "Is outdoor running safe?"),
                            pills,
                            "AirAware recommendations are grounded in ambient environmental physics. For acute symptoms, consult a doctor."
                    );
                }
            } catch (Exception e) {
                log.warn("Gemini call fallback: {}", e.getMessage());
            }
        }

        // Smart dynamic multi-location fallback reply
        String reply;
        if (multiLocationContext.length() > 0) {
            reply = "Here is the real-time air quality observation for the location(s) requested:\n" + multiLocationContext.toString() +
                    "\n\nCompared to your active dashboard (" + activeLoc + " - AQI " + aqi + "), check the outdoor activity windows before planning travel or outdoor workouts.";
        } else {
            reply = generateSmartFallbackReply(userMsg, aqi, category, pollutant, activeLoc);
        }

        return new ChatResponse(
                reply,
                Arrays.asList("Compare air in Pune and Satara", "Is it safe for children outside?", "Should I buy an air purifier?"),
                pills,
                "AirAware provides environmental intelligence. Consult medical specialists for clinical health advice."
        );
    }

    private List<String> detectLocationsInQuery(String query) {
        List<String> found = new ArrayList<>();
        if (query == null) return found;

        // Clean out temporal and filler tokens from ends of candidate string
        Pattern p = Pattern.compile("\\b(?:in|at|for|around|about|near|compare)\\s+([a-zA-Z\\s]{3,20})(?:\\band\\b|\\bwith\\b|\\?|\\.|,|$)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(query);
        while (m.find()) {
            String candidate = sanitizeLocationName(m.group(1));
            if (!isStopWord(candidate) && !found.contains(candidate)) {
                found.add(candidate);
            }
        }

        // Check "compare X and Y"
        Pattern pCompare = Pattern.compile("compare\\s+([a-zA-Z]+)\\s+(?:and|to|with)\\s+([a-zA-Z]+)", Pattern.CASE_INSENSITIVE);
        Matcher mComp = pCompare.matcher(query);
        if (mComp.find()) {
            String c1 = sanitizeLocationName(mComp.group(1));
            String c2 = sanitizeLocationName(mComp.group(2));
            if (!found.contains(c1) && !isStopWord(c1)) found.add(c1);
            if (!found.contains(c2) && !isStopWord(c2)) found.add(c2);
        }

        // Direct single-word search if user just typed a city name (e.g. "Satara", "Nashik")
        if (found.isEmpty() && query.trim().split("\\s+").length <= 3) {
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
        // Remove trailing or leading words like "right now", "today", "currently", "air quality"
        clean = clean.replaceAll("(?i)\\b(right now|currently|today|yesterday|tomorrow|this evening|this morning|air quality|aqi|air)\\b", "").trim();
        return clean;
    }

    private boolean isStopWord(String s) {
        String l = s.toLowerCase().trim();
        return l.isEmpty() || l.equals("the air") || l.equals("air") || l.equals("air quality") || l.equals("aqi") ||
                l.equals("today") || l.equals("now") || l.equals("my location") || l.equals("outside") ||
                l.equals("walk") || l.equals("run") || l.equals("home") || l.equals("office") ||
                l.equals("here") || l.equals("this place") || l.equals("morning") || l.equals("evening");
    }

    private String buildPromptForPlan(DailyPlanRequest req, DailyPlanResponse base) {
        return String.format(
                "You are AirAware, an environmental wellness intelligence companion. " +
                "Location: %s. Current AQI: %d (%s). Dominant Pollutant: %s. " +
                "Profiles: %s. Budget: %s. " +
                "Write a 2-3 sentence personalized morning summary for the user. Emphasize routine adjustments and when to be outdoors. Avoid generic boilerplate.",
                req.getLocationName(), req.getCurrentAqi(), SimulatedAirQualityProvider.getCategoryForAqi(req.getCurrentAqi()),
                req.getDominantPollutant(), req.getHouseholdProfiles(), req.getBudgetPreference()
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

    private String generateSmartFallbackReply(String query, int aqi, String category, String pollutant, String location) {
        String lower = query.toLowerCase();
        if (lower.contains("walk") || lower.contains("run") || lower.contains("exercise") || lower.contains("outdoor")) {
            if (aqi <= 100) {
                return String.format("Yes, outdoor activities in %s are currently safe (AQI %d, %s). The atmosphere is clear. Morning or evening walks will be refreshing with low pulmonary stress.", location, aqi, category);
            } else if (aqi <= 180) {
                return String.format("In %s, outdoor exercise should be moderated today (AQI %d, %s). %s is elevated. If you plan outdoor cardio, aim for the afternoon solar window (1:00 PM – 3:30 PM) when boundary-layer dispersion is highest. Sensitive household members should stay indoors.", location, aqi, category, pollutant);
            } else {
                return String.format("We advise moving your workouts indoors today in %s. The current AQI is %d (%s) dominated by %s. Vigorous outdoor breathing significantly increases deep lung particle deposition. Indoor yoga, pilates, or bodyweight exercises are much safer today.", location, aqi, category, pollutant);
            }
        } else if (lower.contains("window") || lower.contains("ventilat")) {
            if (aqi <= 75) {
                return String.format("Good news: outdoor air in %s is fresh (AQI %d). Now is a great time to open windows on opposing walls for 20-30 minutes to flush out indoor carbon dioxide and cooking fumes.", location, aqi);
            } else {
                return String.format("Keep windows and sliding balcony doors closed right now in %s (AQI %d, %s). Early morning and late evening trap surface smog. If you need fresh air exchange, wait for the peak afternoon heat (around 2:00 PM) for a brief 10-15 minute tactical aeration.", location, aqi, category);
            }
        } else if (lower.contains("purifier") || lower.contains("diy") || lower.contains("filter")) {
            return "You do not necessarily need an expensive multi-hundred dollar purifier! A DIY Corsi-Rosenthal Box (a standard box fan taped to MERV-13 furnace filters) provides exceptional particulate reduction (over 80% PM2.5 capture) for under $40 / ₹3,000. Additionally, creating a single tightly-sealed 'Sanctuary Bedroom' with damp microfiber dusting costs nothing and dramatically lowers overnight inhalation.";
        } else if (lower.contains("child") || lower.contains("kid") || lower.contains("school") || lower.contains("elderly")) {
            return String.format("Children and the elderly have higher minute ventilation relative to body mass. With current AQI at %d in %s, ensure children wear a comfortable, well-fitted N95/KF94 mask during their commute, and encourage schools to conduct physical education in indoor ventilated gyms rather than open dusty fields.", aqi, location);
        } else {
            return String.format("Around %s, the current air quality is %d (%s) with %s as the primary concern. Based on your household context, prioritize indoor air management, seal drafty balcony gaps, and schedule any essential outdoor trips during the midday dispersion window.", location, aqi, category, pollutant);
        }
    }
}
