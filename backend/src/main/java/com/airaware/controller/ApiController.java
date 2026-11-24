package com.airaware.controller;

import com.airaware.dto.*;
import com.airaware.model.AirQualityData;
import com.airaware.service.AirQualityService;
import com.airaware.service.DeterministicRecommendationEngine;
import com.airaware.service.GeminiAssistantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    private final AirQualityService airQualityService;
    private final GeminiAssistantService geminiService;
    private final DeterministicRecommendationEngine deterministicEngine;

    public ApiController(AirQualityService airQualityService,
                         GeminiAssistantService geminiService,
                         DeterministicRecommendationEngine deterministicEngine) {
        this.airQualityService = airQualityService;
        this.geminiService = geminiService;
        this.deterministicEngine = deterministicEngine;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("status", "UP");
        status.put("service", "AirAware Environmental Intelligence Engine");
        status.put("version", "2.0.0");
        status.put("liveProvider", "Open-Meteo & Nominatim");
        status.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(status);
    }

    @GetMapping("/air-quality/current")
    public ResponseEntity<AirQualityData> getCurrentAirQuality(
            @RequestParam(defaultValue = "19.0760") double latitude,
            @RequestParam(defaultValue = "72.8777") double longitude) {
        AirQualityData data = airQualityService.getCurrentAirQuality(latitude, longitude);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/air-quality/forecast")
    public ResponseEntity<AirQualityData> getForecast(
            @RequestParam(defaultValue = "19.0760") double latitude,
            @RequestParam(defaultValue = "72.8777") double longitude) {
        AirQualityData data = airQualityService.getForecast(latitude, longitude);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/air-quality/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(
            @RequestParam(defaultValue = "19.0760") double latitude,
            @RequestParam(defaultValue = "72.8777") double longitude) {
        List<Map<String, Object>> history = new ArrayList<>();
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        int[] baseAqis = {140, 165, 182, 155, 130, 95, 110};

        for (int i = 0; i < 7; i++) {
            Map<String, Object> item = new HashMap<>();
            item.put("day", days[i]);
            item.put("aqi", baseAqis[i]);
            item.put("dominantPollutant", "PM2.5");
            history.add(item);
        }
        return ResponseEntity.ok(history);
    }

    @GetMapping("/locations/search")
    public ResponseEntity<List<Map<String, Object>>> searchLocations(@RequestParam String query) {
        return ResponseEntity.ok(airQualityService.searchLocations(query));
    }

    @GetMapping("/locations/reverse-geocode")
    public ResponseEntity<Map<String, Object>> reverseGeocode(
            @RequestParam double latitude,
            @RequestParam double longitude) {
        return ResponseEntity.ok(airQualityService.reverseGeocode(latitude, longitude));
    }

    @GetMapping("/locations/detect-ip")
    public ResponseEntity<Map<String, Object>> detectIpLocation() {
        return ResponseEntity.ok(airQualityService.detectIpLocation());
    }

    @PostMapping("/ai/daily-plan")
    public ResponseEntity<DailyPlanResponse> generateDailyPlan(@RequestBody DailyPlanRequest request) {
        DailyPlanResponse response = geminiService.getPersonalizedDailyPlan(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ai/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse response = geminiService.handleChat(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ai/indoor-recommendations")
    public ResponseEntity<IndoorRecommendationResponse> indoorRecommendations(@RequestBody IndoorRecommendationRequest request) {
        IndoorRecommendationResponse response = deterministicEngine.generateIndoorAdvice(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/ai/impact-analysis")
    public ResponseEntity<ImpactAnalysisResponse> impactAnalysis(@RequestBody ImpactAnalysisRequest request) {
        ImpactAnalysisResponse response = deterministicEngine.generateImpact(request);
        return ResponseEntity.ok(response);
    }
}
