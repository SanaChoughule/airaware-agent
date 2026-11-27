package com.airaware.service;

import com.airaware.model.AirQualityData;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class AirQualityService {
    private static final Logger log = LoggerFactory.getLogger(AirQualityService.class);

    private final LiveAirQualityProvider liveProvider;
    private final SimulatedAirQualityProvider fallbackProvider;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public AirQualityService(LiveAirQualityProvider liveProvider,
                             SimulatedAirQualityProvider fallbackProvider,
                             ObjectMapper objectMapper) {
        this.liveProvider = liveProvider;
        this.fallbackProvider = fallbackProvider;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .codecs(c -> c.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .defaultHeader("User-Agent", "AirAware-Environmental-Assistant/2.5")
                .build();
    }

    public AirQualityData getCurrentAirQuality(double lat, double lng) {
        AirQualityData data = liveProvider.getCurrentAirQuality(lat, lng);
        
        // Enrich with granular administrative reverse geocode if locationName is missing or generic
        if (data.getLocationName() == null || data.getLocationName().startsWith("Coordinates")) {
            Map<String, Object> geo = reverseGeocode(lat, lng);
            if (geo.containsKey("formattedAddress")) {
                data.setLocationName((String) geo.get("formattedAddress"));
            }
            if (geo.containsKey("city")) data.setCity((String) geo.get("city"));
            if (geo.containsKey("state")) data.setState((String) geo.get("state"));
            if (geo.containsKey("country")) data.setCountry((String) geo.get("country"));
        }
        return data;
    }

    public AirQualityData getForecast(double lat, double lng) {
        return getCurrentAirQuality(lat, lng);
    }

    /**
     * Search locations using OpenStreetMap Nominatim.
     * Validates input: Returns EMPTY list for unidentifiable or gibberish input.
     * NEVER synthesizes fake coordinates.
     */
    public List<Map<String, Object>> searchLocations(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (query == null || query.trim().length() < 2) {
            return results;
        }

        String trimmed = query.trim();

        // 1. Try real OpenStreetMap Nominatim global geocoding API
        try {
            String url = "https://nominatim.openstreetmap.org/search?format=json&limit=8&addressdetails=1&q="
                    + URLEncoder.encode(trimmed, StandardCharsets.UTF_8);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response != null && !response.isEmpty()) {
                JsonNode array = objectMapper.readTree(response);
                if (array.isArray() && array.size() > 0) {
                    for (JsonNode item : array) {
                        Map<String, Object> entry = new LinkedHashMap<>();
                        String displayName = item.path("display_name").asText();
                        double lat = Double.parseDouble(item.path("lat").asText());
                        double lon = Double.parseDouble(item.path("lon").asText());

                        JsonNode addr = item.path("address");
                        String landmarkOrPlace = extractPrimaryPlaceName(item, addr);
                        String city = extractCity(addr);
                        String state = addr.has("state") ? addr.path("state").asText() : "";
                        String country = addr.has("country") ? addr.path("country").asText() : "";

                        // Structured naming
                        entry.put("name", landmarkOrPlace);
                        entry.put("displayName", displayName);
                        entry.put("city", city);
                        entry.put("state", state);
                        entry.put("country", country);
                        entry.put("latitude", lat);
                        entry.put("longitude", lon);
                        entry.put("precision", determinePrecision(item));
                        results.add(entry);
                    }
                    if (!results.isEmpty()) {
                        return results;
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Nominatim global search failed for '{}': {}", trimmed, ex.getMessage());
        }

        // 2. Preset match fallback only for recognized preset names
        String qLower = trimmed.toLowerCase();
        for (Map.Entry<String, SimulatedAirQualityProvider.CityProfile> entry : SimulatedAirQualityProvider.PRESET_LOCATIONS.entrySet()) {
            SimulatedAirQualityProvider.CityProfile cp = entry.getValue();
            if (cp.name.toLowerCase().contains(qLower) || entry.getKey().toLowerCase().contains(qLower)) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("name", cp.name);
                item.put("displayName", cp.name);
                item.put("city", entry.getKey());
                item.put("state", "");
                item.put("country", "");
                item.put("latitude", cp.lat);
                item.put("longitude", cp.lng);
                item.put("baseAqi", cp.baseAqi);
                item.put("precision", "city_level");
                results.add(item);
            }
        }

        // Rule: If no legitimate result is found, return empty array. NEVER generate synthetic fake coordinates.
        return results;
    }

    public Map<String, Object> reverseGeocode(double lat, double lng) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("latitude", lat);
        result.put("longitude", lng);

        try {
            String url = String.format(Locale.US,
                    "https://nominatim.openstreetmap.org/reverse?format=json&lat=%.5f&lon=%.5f&addressdetails=1",
                    lat, lng);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response != null && !response.isEmpty()) {
                JsonNode root = objectMapper.readTree(response);
                String displayName = root.path("display_name").asText();
                JsonNode addr = root.path("address");
                String place = extractPrimaryPlaceName(root, addr);
                String city = extractCity(addr);
                String state = addr.has("state") ? addr.path("state").asText() : "";
                String country = addr.has("country") ? addr.path("country").asText() : "";

                result.put("formattedAddress", place);
                result.put("fullAddress", displayName);
                result.put("locality", place);
                result.put("city", city);
                result.put("state", state);
                result.put("country", country);
                return result;
            }
        } catch (Exception ex) {
            log.warn("Nominatim reverse geocode failed for ({}, {}): {}", lat, lng, ex.getMessage());
        }

        // Check presets
        for (SimulatedAirQualityProvider.CityProfile cp : SimulatedAirQualityProvider.PRESET_LOCATIONS.values()) {
            if (Math.abs(cp.lat - lat) < 0.35 && Math.abs(cp.lng - lng) < 0.35) {
                result.put("formattedAddress", cp.name);
                result.put("locality", cp.name.split(",")[0]);
                result.put("city", cp.name.split(",")[0]);
                return result;
            }
        }

        result.put("formattedAddress", String.format("Coordinates (%.4f° N, %.4f° E)", lat, lng));
        result.put("locality", "Local Area");
        return result;
    }

    public Map<String, Object> detectIpLocation() {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            String response = webClient.get()
                    .uri("http://ip-api.com/json")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response != null && !response.isEmpty()) {
                JsonNode root = objectMapper.readTree(response);
                if ("success".equalsIgnoreCase(root.path("status").asText())) {
                    double lat = root.path("lat").asDouble();
                    double lon = root.path("lon").asDouble();
                    String city = root.path("city").asText();
                    String region = root.path("regionName").asText();
                    String country = root.path("country").asText();

                    String full = city + ", " + region + ", " + country;
                    result.put("latitude", lat);
                    result.put("longitude", lon);
                    result.put("formattedAddress", full);
                    result.put("locality", city);
                    result.put("city", city);
                    result.put("state", region);
                    result.put("country", country);
                    result.put("precision", "city_level");
                    result.put("source", "IP Geolocation");
                    return result;
                }
            }
        } catch (Exception ex) {
            log.warn("IP Geolocation detection failed: {}", ex.getMessage());
        }

        // Standard default fallback
        result.put("latitude", 19.0760);
        result.put("longitude", 72.8777);
        result.put("formattedAddress", "Mumbai, Maharashtra, India");
        result.put("locality", "Mumbai");
        result.put("city", "Mumbai");
        result.put("state", "Maharashtra");
        result.put("country", "India");
        result.put("precision", "city_level");
        result.put("source", "Default");
        return result;
    }

    private String extractPrimaryPlaceName(JsonNode item, JsonNode addr) {
        if (addr != null && !addr.isMissingNode()) {
            // Check for specific landmark / amenity / waterbody names
            String landmark = addr.has("leisure") ? addr.path("leisure").asText()
                    : addr.has("water") ? addr.path("water").asText()
                    : addr.has("lake") ? addr.path("lake").asText()
                    : addr.has("tourism") ? addr.path("tourism").asText()
                    : addr.has("amenity") ? addr.path("amenity").asText()
                    : addr.has("natural") ? addr.path("natural").asText() : "";

            String suburb = addr.has("suburb") ? addr.path("suburb").asText()
                    : addr.has("neighbourhood") ? addr.path("neighbourhood").asText() : "";

            String city = extractCity(addr);

            // If Nominatim has a name field directly
            String directName = item.has("name") && !item.path("name").asText().isEmpty() 
                    ? item.path("name").asText() : "";

            if (!directName.isEmpty()) {
                if (!city.isEmpty() && !directName.toLowerCase().contains(city.toLowerCase())) {
                    return directName + ", " + city;
                }
                return directName;
            }

            if (!landmark.isEmpty()) {
                return !city.isEmpty() ? landmark + ", " + city : landmark;
            }

            if (!suburb.isEmpty() && !city.isEmpty() && !suburb.equalsIgnoreCase(city)) {
                return suburb + ", " + city;
            }
            if (!city.isEmpty()) {
                String state = addr.has("state") ? addr.path("state").asText() : "";
                return !state.isEmpty() ? city + ", " + state : city;
            }
        }

        String displayName = item.path("display_name").asText();
        String[] parts = displayName.split(",");
        if (parts.length >= 2) {
            return parts[0].trim() + ", " + parts[1].trim();
        }
        return displayName;
    }

    private String extractCity(JsonNode addr) {
        if (addr == null || addr.isMissingNode()) return "";
        return addr.has("city") ? addr.path("city").asText()
                : addr.has("town") ? addr.path("town").asText()
                : addr.has("municipality") ? addr.path("municipality").asText()
                : addr.has("village") ? addr.path("village").asText()
                : addr.has("county") ? addr.path("county").asText() : "";
    }

    private String determinePrecision(JsonNode item) {
        String clazz = item.path("class").asText("");
        String type = item.path("type").asText("");
        if ("leisure".equals(clazz) || "tourism".equals(clazz) || "amenity".equals(clazz) || "natural".equals(clazz) || "water".equals(type)) {
            return "exact_landmark";
        }
        if ("suburb".equals(type) || "neighbourhood".equals(type) || "residential".equals(type)) {
            return "locality";
        }
        return "city_level";
    }
}
