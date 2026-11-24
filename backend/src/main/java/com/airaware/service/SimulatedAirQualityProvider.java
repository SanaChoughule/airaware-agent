package com.airaware.service;

import com.airaware.model.AirQualityData;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class SimulatedAirQualityProvider implements AirQualityProvider {

    // Preset standard reference cities for realistic demo
    public static final Map<String, CityProfile> PRESET_LOCATIONS = new LinkedHashMap<>();

    static {
        PRESET_LOCATIONS.put("Delhi", new CityProfile("Delhi, India", 28.6139, 77.2090, 318, "PM2.5", "Very Poor", "High"));
        PRESET_LOCATIONS.put("Mumbai", new CityProfile("Mumbai, Maharashtra, India", 19.0760, 72.8777, 162, "PM2.5", "Poor", "Moderate"));
        PRESET_LOCATIONS.put("Bengaluru", new CityProfile("Bengaluru, Karnataka, India", 12.9716, 77.5946, 68, "PM10", "Moderate", "Low"));
        PRESET_LOCATIONS.put("Pune", new CityProfile("Pune, Maharashtra, India", 18.5204, 73.8567, 114, "PM2.5", "Moderate", "Moderate"));
        PRESET_LOCATIONS.put("London", new CityProfile("London, United Kingdom", 51.5074, -0.1278, 38, "NO2", "Good", "Low"));
        PRESET_LOCATIONS.put("New York", new CityProfile("New York, NY, USA", 40.7128, -74.0060, 45, "O3", "Good", "Low"));
    }

    public static class CityProfile {
        public String name;
        public double lat;
        public double lng;
        public int baseAqi;
        public String dominantPollutant;
        public String category;
        public String risk;

        public CityProfile(String name, double lat, double lng, int baseAqi, String dominantPollutant, String category, String risk) {
            this.name = name;
            this.lat = lat;
            this.lng = lng;
            this.baseAqi = baseAqi;
            this.dominantPollutant = dominantPollutant;
            this.category = category;
            this.risk = risk;
        }
    }

    @Override
    public String getProviderName() {
        return "Simulated / Deterministic Environmental Engine";
    }

    @Override
    public AirQualityData getCurrentAirQuality(double latitude, double longitude) {
        CityProfile matched = findNearestPreset(latitude, longitude);
        AirQualityData data = new AirQualityData();
        data.setLatitude(latitude);
        data.setLongitude(longitude);
        data.setLocationName(matched != null ? matched.name : String.format("Coordinates (%.3f, %.3f)", latitude, longitude));
        
        int aqi = matched != null ? matched.baseAqi : calculateSyntheticAqi(latitude, longitude);
        data.setAqi(aqi);
        data.setCategory(getCategoryForAqi(aqi));
        data.setHealthRisk(getHealthRiskForAqi(aqi));
        data.setDominantPollutant(matched != null ? matched.dominantPollutant : "PM2.5");
        data.setLastUpdated(LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a, dd MMM yyyy")));
        data.setSimulated(true);

        // Generate realistic pollutants
        Map<String, AirQualityData.PollutantDetail> pollutants = new LinkedHashMap<>();
        double pm25Val = Math.round(aqi * 0.42 * 10.0) / 10.0;
        double pm10Val = Math.round(aqi * 0.78 * 10.0) / 10.0;
        double o3Val = Math.round((20 + (aqi % 35)) * 10.0) / 10.0;
        double no2Val = Math.round((15 + (aqi % 40)) * 10.0) / 10.0;
        double so2Val = Math.round((8 + (aqi % 15)) * 10.0) / 10.0;
        double coVal = Math.round((0.4 + (aqi * 0.003)) * 10.0) / 10.0;

        pollutants.put("PM2.5", new AirQualityData.PollutantDetail("PM2.5", pm25Val, "µg/m³", getCategoryForAqi(aqi), (int)((pm25Val / 60.0) * 100), "Fine inhalable particles penetrating deep into lungs and bloodstream."));
        pollutants.put("PM10", new AirQualityData.PollutantDetail("PM10", pm10Val, "µg/m³", getCategoryForAqi((int)(aqi * 0.85)), (int)((pm10Val / 100.0) * 100), "Coarse dust, construction debris and road dust irritating upper airway."));
        pollutants.put("O3", new AirQualityData.PollutantDetail("O3", o3Val, "µg/m³", "Good", 35, "Ground-level ozone formed by sunlight reacting with vehicular emissions."));
        pollutants.put("NO2", new AirQualityData.PollutantDetail("NO2", no2Val, "µg/m³", "Good", 28, "Nitrogen dioxide largely emitted from vehicle engines and power generation."));
        pollutants.put("SO2", new AirQualityData.PollutantDetail("SO2", so2Val, "µg/m³", "Good", 18, "Sulfur dioxide produced by industrial fossil fuel combustion."));
        pollutants.put("CO", new AirQualityData.PollutantDetail("CO", coVal, "mg/m³", "Good", 15, "Carbon monoxide from incomplete combustion of hydrocarbon fuels."));

        data.setPollutants(pollutants);

        // Generate 24-hr hourly forecast
        List<AirQualityData.HourlyForecast> hourly = new ArrayList<>();
        int currentHour = LocalDateTime.now().getHour();
        int lowestAqiHour = -1;
        int lowestAqiVal = Integer.MAX_VALUE;

        for (int i = 0; i < 24; i++) {
            int hr = (currentHour + i) % 24;
            String timeLabel = String.format("%02d:00", hr);
            // diurnal cycle: peaks at 8-10 AM and 8-10 PM; lower in afternoon 1-4 PM
            double diurnalFactor = 1.0;
            if (hr >= 7 && hr <= 10) diurnalFactor = 1.25;
            else if (hr >= 13 && hr <= 16) diurnalFactor = 0.72;
            else if (hr >= 20 && hr <= 23) diurnalFactor = 1.15;
            else if (hr >= 1 && hr <= 5) diurnalFactor = 0.85;

            int forecastAqi = Math.max(25, (int)(aqi * diurnalFactor + ((i % 5) - 2) * 4));
            if (forecastAqi < lowestAqiVal) {
                lowestAqiVal = forecastAqi;
                lowestAqiHour = hr;
            }
            boolean recommended = (forecastAqi < 100) || (forecastAqi == lowestAqiVal);
            hourly.add(new AirQualityData.HourlyForecast(
                    timeLabel,
                    forecastAqi,
                    getCategoryForAqi(forecastAqi),
                    Math.round(forecastAqi * 0.42 * 10.0) / 10.0,
                    recommended
            ));
        }
        data.setHourlyForecast(hourly);
        data.setBestOutdoorWindow(String.format("%02d:00 – %02d:00 (AQI ~%d)", lowestAqiHour, (lowestAqiHour + 2) % 24, lowestAqiVal));

        data.setSummary(generateDeterministicSummary(aqi, data.getCategory(), data.getDominantPollutant()));
        return data;
    }

    @Override
    public AirQualityData getForecast(double latitude, double longitude) {
        return getCurrentAirQuality(latitude, longitude);
    }

    private CityProfile findNearestPreset(double lat, double lng) {
        for (CityProfile profile : PRESET_LOCATIONS.values()) {
            double dLat = Math.abs(profile.lat - lat);
            double dLng = Math.abs(profile.lng - lng);
            if (dLat < 0.35 && dLng < 0.35) {
                return profile;
            }
        }
        return null;
    }

    private int calculateSyntheticAqi(double lat, double lng) {
        // Deterministic pseudo-random AQI based on coordinates
        int seed = (int)(Math.abs(lat * 100) + Math.abs(lng * 100)) % 250;
        return Math.max(40, seed + 30);
    }

    public static String getCategoryForAqi(int aqi) {
        if (aqi <= 50) return "Good";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 200) return "Poor";
        if (aqi <= 300) return "Very Poor";
        return "Severe";
    }

    public static String getHealthRiskForAqi(int aqi) {
        if (aqi <= 50) return "Low";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 200) return "High";
        if (aqi <= 300) return "Very High";
        return "Hazardous";
    }

    private String generateDeterministicSummary(int aqi, String category, String dominant) {
        if (aqi <= 50) {
            return "Air quality is optimal for all outdoor and indoor pursuits. Perfect window to ventilate your living spaces.";
        } else if (aqi <= 100) {
            return "Air quality is acceptable. Unusually sensitive individuals may experience minor cough; outdoor workouts remain safe.";
        } else if (aqi <= 200) {
            return "Air quality is poor with " + dominant + " dominating. Sensitive groups, children and elderly should reduce prolonged outdoor exertion.";
        } else if (aqi <= 300) {
            return "Air quality is very poor. High concentrations of " + dominant + " pose respiratory discomfort. Shift intense cardio indoors and keep windows closed.";
        } else {
            return "Air quality has reached severe levels. Emergency precautions advised: avoid outdoor exposure, activate HEPA purifiers, and wear N95/FFP2 masks outside.";
        }
    }
}
