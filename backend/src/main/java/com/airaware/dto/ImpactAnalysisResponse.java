package com.airaware.dto;

import java.util.List;

public class ImpactAnalysisResponse {
    private int dailyActionScore;
    private int weeklyConsistencyScore;
    private List<ImpactItem> impactHighlights;
    private String qualitativeSummary;
    private String methodologyNote;

    public ImpactAnalysisResponse() {}

    public int getDailyActionScore() { return dailyActionScore; }
    public void setDailyActionScore(int dailyActionScore) { this.dailyActionScore = dailyActionScore; }

    public int getWeeklyConsistencyScore() { return weeklyConsistencyScore; }
    public void setWeeklyConsistencyScore(int weeklyConsistencyScore) { this.weeklyConsistencyScore = weeklyConsistencyScore; }

    public List<ImpactItem> getImpactHighlights() { return impactHighlights; }
    public void setImpactHighlights(List<ImpactItem> impactHighlights) { this.impactHighlights = impactHighlights; }

    public String getQualitativeSummary() { return qualitativeSummary; }
    public void setQualitativeSummary(String qualitativeSummary) { this.qualitativeSummary = qualitativeSummary; }

    public String getMethodologyNote() { return methodologyNote; }
    public void setMethodologyNote(String methodologyNote) { this.methodologyNote = methodologyNote; }

    public static class ImpactItem {
        private String label;
        private String qualitativeImpact; // "Reduced emissions", "Reduced pollution exposure", "Health-conscious choice", "Sustainable habit"
        private String description;
        private String category;

        public ImpactItem() {}
        public ImpactItem(String label, String qualitativeImpact, String description, String category) {
            this.label = label;
            this.qualitativeImpact = qualitativeImpact;
            this.description = description;
            this.category = category;
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getQualitativeImpact() { return qualitativeImpact; }
        public void setQualitativeImpact(String qualitativeImpact) { this.qualitativeImpact = qualitativeImpact; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }
}
