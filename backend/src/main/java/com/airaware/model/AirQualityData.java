package com.airaware.model;

import java.util.List;
import java.util.Map;

public class AirQualityData {
    private double latitude;
    private double longitude;
    private String locationName;
    private int aqi;
    private String category; // Good, Moderate, Poor, Very Poor, Severe
    private String healthRisk; // Low, Moderate, High, Critical
    private String dominantPollutant;
    private String summary;
    private String lastUpdated;
    private boolean isSimulated;
    private Map<String, PollutantDetail> pollutants;
    private List<HourlyForecast> hourlyForecast;
    private String bestOutdoorWindow;

    public AirQualityData() {}

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public int getAqi() { return aqi; }
    public void setAqi(int aqi) { this.aqi = aqi; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getHealthRisk() { return healthRisk; }
    public void setHealthRisk(String healthRisk) { this.healthRisk = healthRisk; }

    public String getDominantPollutant() { return dominantPollutant; }
    public void setDominantPollutant(String dominantPollutant) { this.dominantPollutant = dominantPollutant; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }

    public boolean isSimulated() { return isSimulated; }
    public void setSimulated(boolean simulated) { isSimulated = simulated; }

    public Map<String, PollutantDetail> getPollutants() { return pollutants; }
    public void setPollutants(Map<String, PollutantDetail> pollutants) { this.pollutants = pollutants; }

    public List<HourlyForecast> getHourlyForecast() { return hourlyForecast; }
    public void setHourlyForecast(List<HourlyForecast> hourlyForecast) { this.hourlyForecast = hourlyForecast; }

    public String getBestOutdoorWindow() { return bestOutdoorWindow; }
    public void setBestOutdoorWindow(String bestOutdoorWindow) { this.bestOutdoorWindow = bestOutdoorWindow; }

    public static class PollutantDetail {
        private String name;
        private double value;
        private String unit;
        private String category;
        private int percentOfStandard;
        private String explanation;

        public PollutantDetail() {}
        public PollutantDetail(String name, double value, String unit, String category, int percentOfStandard, String explanation) {
            this.name = name;
            this.value = value;
            this.unit = unit;
            this.category = category;
            this.percentOfStandard = percentOfStandard;
            this.explanation = explanation;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public double getValue() { return value; }
        public void setValue(double value) { this.value = value; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public int getPercentOfStandard() { return percentOfStandard; }
        public void setPercentOfStandard(int percentOfStandard) { this.percentOfStandard = percentOfStandard; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public static class HourlyForecast {
        private String time;
        private int aqi;
        private String category;
        private double pm25;
        private boolean isRecommendedWindow;

        public HourlyForecast() {}
        public HourlyForecast(String time, int aqi, String category, double pm25, boolean isRecommendedWindow) {
            this.time = time;
            this.aqi = aqi;
            this.category = category;
            this.pm25 = pm25;
            this.isRecommendedWindow = isRecommendedWindow;
        }

        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }
        public int getAqi() { return aqi; }
        public void setAqi(int aqi) { this.aqi = aqi; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public double getPm25() { return pm25; }
        public void setPm25(double pm25) { this.pm25 = pm25; }
        public boolean isRecommendedWindow() { return isRecommendedWindow; }
        public void setRecommendedWindow(boolean recommendedWindow) { isRecommendedWindow = recommendedWindow; }
    }
}
