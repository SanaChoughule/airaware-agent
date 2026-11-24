package com.airaware.dto;

import java.util.List;

public class DailyPlanResponse {
    private String dailySummary;
    private String riskLevel;
    private String bestOutdoorWindow;
    private List<RoutineSection> routineSections;
    private List<String> sustainabilityActions;
    private String disclaimer;

    public DailyPlanResponse() {}

    public String getDailySummary() { return dailySummary; }
    public void setDailySummary(String dailySummary) { this.dailySummary = dailySummary; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getBestOutdoorWindow() { return bestOutdoorWindow; }
    public void setBestOutdoorWindow(String bestOutdoorWindow) { this.bestOutdoorWindow = bestOutdoorWindow; }

    public List<RoutineSection> getRoutineSections() { return routineSections; }
    public void setRoutineSections(List<RoutineSection> routineSections) { this.routineSections = routineSections; }

    public List<String> getSustainabilityActions() { return sustainabilityActions; }
    public void setSustainabilityActions(List<String> sustainabilityActions) { this.sustainabilityActions = sustainabilityActions; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }

    public static class RoutineSection {
        private String timeOfDay; // Morning, Commute, Afternoon, Evening, Night
        private String title;
        private List<PlanAction> actions;

        public RoutineSection() {}
        public RoutineSection(String timeOfDay, String title, List<PlanAction> actions) {
            this.timeOfDay = timeOfDay;
            this.title = title;
            this.actions = actions;
        }

        public String getTimeOfDay() { return timeOfDay; }
        public void setTimeOfDay(String timeOfDay) { this.timeOfDay = timeOfDay; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public List<PlanAction> getActions() { return actions; }
        public void setActions(List<PlanAction> actions) { this.actions = actions; }
    }

    public static class PlanAction {
        private String id;
        private String category; // exercise, commute, ventilation, errand, indoor
        private String action;
        private String reason;
        private String alternative;
        private String expectedBenefit;
        private String priority; // high, medium, low
        private String confidence; // e.g., "High (AQI Trend + Household Sensitivity)"
        private boolean completed;

        public PlanAction() {}
        public PlanAction(String id, String category, String action, String reason, String alternative, String expectedBenefit, String priority, String confidence) {
            this.id = id;
            this.category = category;
            this.action = action;
            this.reason = reason;
            this.alternative = alternative;
            this.expectedBenefit = expectedBenefit;
            this.priority = priority;
            this.confidence = confidence;
            this.completed = false;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getAlternative() { return alternative; }
        public void setAlternative(String alternative) { this.alternative = alternative; }
        public String getExpectedBenefit() { return expectedBenefit; }
        public void setExpectedBenefit(String expectedBenefit) { this.expectedBenefit = expectedBenefit; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getConfidence() { return confidence; }
        public void setConfidence(String confidence) { this.confidence = confidence; }
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }
}
