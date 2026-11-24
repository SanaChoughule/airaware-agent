package com.airaware.dto;

import java.util.List;

public class DailyPlanRequest {
    private double latitude;
    private double longitude;
    private String locationName;
    private int currentAqi;
    private String dominantPollutant;
    private List<String> householdProfiles; // e.g. ["children", "elderly", "respiratory-sensitive"]
    private String commuteType; // "public_transit", "car_ac", "two_wheeler", "walking"
    private String exerciseHabit; // "morning_outdoor", "evening_outdoor", "indoor"
    private String budgetPreference; // "no-cost", "low-cost", "moderate", "premium"
    private boolean hasAirPurifier;
    private String cookingType; // "lpg_well_ventilated", "frying_open_kitchen"

    public DailyPlanRequest() {}

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

    public String getCommuteType() { return commuteType; }
    public void setCommuteType(String commuteType) { this.commuteType = commuteType; }

    public String getExerciseHabit() { return exerciseHabit; }
    public void setExerciseHabit(String exerciseHabit) { this.exerciseHabit = exerciseHabit; }

    public String getBudgetPreference() { return budgetPreference; }
    public void setBudgetPreference(String budgetPreference) { this.budgetPreference = budgetPreference; }

    public boolean isHasAirPurifier() { return hasAirPurifier; }
    public void setHasAirPurifier(boolean hasAirPurifier) { this.hasAirPurifier = hasAirPurifier; }

    public String getCookingType() { return cookingType; }
    public void setCookingType(String cookingType) { this.cookingType = cookingType; }
}
