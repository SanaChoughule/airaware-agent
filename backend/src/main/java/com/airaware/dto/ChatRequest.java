package com.airaware.dto;

import java.util.List;
import java.util.Map;

public class ChatRequest {
    private String message;
    private double latitude;
    private double longitude;
    private String locationName;
    private int currentAqi;
    private String dominantPollutant;
    private List<String> householdProfiles;
    private String budgetPreference;
    private List<Map<String, String>> conversationHistory;

    public ChatRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public int getCurrentAqi() { return currentAqi; }
    public void setCurrentAqi(int currentAqi) { this.currentAqi = currentAqi; }

    public String getDominantPollutant() { return dominantPollutant; }
    public void setDominantPollutant(String dominantPollutant) { this.dominantPollutant = dominantPollutant; }

    public List<String> getHouseholdProfiles() { return householdProfiles; }
    public void setHouseholdProfiles(List<String> householdProfiles) { this.householdProfiles = householdProfiles; }

    public String getBudgetPreference() { return budgetPreference; }
    public void setBudgetPreference(String budgetPreference) { this.budgetPreference = budgetPreference; }

    public List<Map<String, String>> getConversationHistory() { return conversationHistory; }
    public void setConversationHistory(List<Map<String, String>> conversationHistory) { this.conversationHistory = conversationHistory; }
}
