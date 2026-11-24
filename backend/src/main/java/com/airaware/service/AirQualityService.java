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
                .defaultHeader("User-Agent", "AirAware-Intelligence/2.0 (Environmental-Companion)")
                .build();
    }

    public AirQualityData getCurrentAirQuality(double lat, double lng) {
        AirQualityData data = liveProvider.getCurrentAirQuality(lat, lng);
        if (data.getLocationName() == null || data.getLocationName().startsWith("Coordinates")) {
            Map<String, Object> geo = reverseGeocode(lat, lng);
            if (geo.containsKey("formattedAddress")) {
                data.setLocationName((String) geo.get("formattedAddress"));
            }
        }
        return data;
    }

    public AirQualityData getForecast(double lat, double lng) {
        return getCurrentAirQuality(lat, lng);
    }

    public List<Map<String, Object>> searchLocations(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (query == null || query.trim().isEmpty()) {
            return results;
        }

        String trimmed = query.trim();

        // 1. Try real OpenStreetMap Nominatim global geocoding API
        try {
            String url = "https://nominatim.openstreetmap.org/search?format=json&limit=6&addressdetails=1&q="
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

                        // Short clean label
                        String cleanName = buildCleanName(item, displayName);
                        entry.put("name", cleanName);
                        entry.put("displayName", displayName);
                        entry.put("latitude", lat);
                        entry.put("longitude", lon);
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

        // 2. Preset match fallback
        String qLower = trimmed.toLowerCase();
        for (Map.Entry<String, SimulatedAirQualityProvider.CityProfile> entry : SimulatedAirQualityProvider.PRESET_LOCATIONS.entrySet()) {
            SimulatedAirQualityProvider.CityProfile cp = entry.getValue();
            if (cp.name.toLowerCase().contains(qLower) || entry.getKey().toLowerCase().contains(qLower)) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("name", cp.name);
                item.put("displayName", cp.name);
                item.put("latitude", cp.lat);
                item.put("longitude", cp.lng);
                item.put("baseAqi", cp.baseAqi);
                results.add(item);
            }
        }

        // 3. Synthetic fallback for any arbitrary query if offline
        if (results.isEmpty()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", trimmed);
            item.put("displayName", trimmed + ", Urban District");
            item.put("latitude", 17.68 + (Math.abs(trimmed.hashCode() % 500) * 0.01));
            item.put("longitude", 74.00 + (Math.abs(trimmed.hashCode() % 500) * 0.01));
            results.add(item);
        }

        return results;
    }

    public Map<String, Object> reverseGeocode(double lat, double lng) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("latitude", lat);
        result.put("longitude", lng);

        try {
            String url = String.format(Locale.US,
                    "https://nominatim.openstreetmap.org/reverse?format=json&lat=%.4f&lon=%.4f",
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
                String locality = extractLocality(addr);

                result.put("formattedAddress", !locality.isEmpty() ? locality : displayName);
                result.put("fullAddress", displayName);
                result.put("locality", locality);
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
                return result;
            }
        }

        result.put("formattedAddress", String.format("Location (%.3f° N, %.3f° E)", lat, lng));
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
                    result.put("source", "IP Geolocation");
                    return result;
                }
            }
        } catch (Exception ex) {
            log.warn("IP Geolocation detection failed: {}", ex.getMessage());
        }

        // Default to Mumbai if external lookup fails
        result.put("latitude", 19.0760);
        result.put("longitude", 72.8777);
        result.put("formattedAddress", "Mumbai, Maharashtra, India");
        result.put("locality", "Mumbai");
        result.put("source", "Default");
        return result;
    }

    private String buildCleanName(JsonNode item, String displayName) {
        JsonNode addr = item.path("address");
        if (!addr.isMissingNode()) {
            String city = addr.has("city") ? addr.path("city").asText()
                    : addr.has("town") ? addr.path("town").asText()
                    : addr.has("village") ? addr.path("village").asText()
                    : addr.has("county") ? addr.path("county").asText() : "";

            String state = addr.has("state") ? addr.path("state").asText() : "";
            String country = addr.has("country") ? addr.path("country").asText() : "";

            if (!city.isEmpty()) {
                if (!state.isEmpty() && !country.isEmpty()) return city + ", " + state + ", " + country;
                if (!state.isEmpty()) return city + ", " + state;
                return city;
            }
        }
        String[] parts = displayName.split(",");
        if (parts.length >= 3) {
            return parts[0].trim() + ", " + parts[1].trim() + ", " + parts[parts.length - 1].trim();
        }
        return displayName;
    }

    private String extractLocality(JsonNode addr) {
        if (addr == null || addr.isMissingNode()) return "";
        String place = addr.has("suburb") ? addr.path("suburb").asText()
                : addr.has("neighbourhood") ? addr.path("neighbourhood").asText()
                : addr.has("city") ? addr.path("city").asText()
                : addr.has("town") ? addr.path("town").asText() : "";

        String city = addr.has("city") ? addr.path("city").asText()
                : addr.has("county") ? addr.path("county").asText() : "";
        String state = addr.has("state") ? addr.path("state").asText() : "";

        if (!place.isEmpty() && !city.isEmpty() && !place.equalsIgnoreCase(city)) {
            return place + ", " + city;
        }
        if (!city.isEmpty() && !state.isEmpty()) {
            return city + ", " + state;
        }
        return place.isEmpty() ? city : place;
    }
}
