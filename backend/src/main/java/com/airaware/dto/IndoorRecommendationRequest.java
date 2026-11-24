package com.airaware.dto;

import java.util.List;

public class IndoorRecommendationRequest {
    private int currentOutdoorAqi;
    private String dominantPollutant;
    private List<String> householdProfiles;
    private String roomType; // living_room, bedroom, kitchen, whole_house
    private String budgetPreference; // no-cost, low-cost, moderate, premium
    private boolean hasPurifier;
    private boolean hasExhaust;

    public IndoorRecommendationRequest() {}

    public int getCurrentOutdoorAqi() { return currentOutdoorAqi; }
    public void setCurrentOutdoorAqi(int currentOutdoorAqi) { this.currentOutdoorAqi = currentOutdoorAqi; }

    public String getDominantPollutant() { return dominantPollutant; }
    public void setDominantPollutant(String dominantPollutant) { this.dominantPollutant = dominantPollutant; }

    public List<String> getHouseholdProfiles() { return householdProfiles; }
    public void setHouseholdProfiles(List<String> householdProfiles) { this.householdProfiles = householdProfiles; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public String getBudgetPreference() { return budgetPreference; }
    public void setBudgetPreference(String budgetPreference) { this.budgetPreference = budgetPreference; }

    public boolean isHasPurifier() { return hasPurifier; }
    public void setHasPurifier(boolean hasPurifier) { this.hasPurifier = hasPurifier; }

    public boolean isHasExhaust() { return hasExhaust; }
    public void setHasExhaust(boolean hasExhaust) { this.hasExhaust = hasExhaust; }
}
