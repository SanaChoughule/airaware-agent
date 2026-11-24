package com.airaware.dto;

import java.util.List;

public class IndoorRecommendationResponse {
    private String ventilationGuidance;
    private String filtrationGuidance;
    private List<ChecklistItem> cleanAirChecklist;
    private List<BudgetSolution> budgetSolutions;

    public IndoorRecommendationResponse() {}

    public String getVentilationGuidance() { return ventilationGuidance; }
    public void setVentilationGuidance(String ventilationGuidance) { this.ventilationGuidance = ventilationGuidance; }

    public String getFiltrationGuidance() { return filtrationGuidance; }
    public void setFiltrationGuidance(String filtrationGuidance) { this.filtrationGuidance = filtrationGuidance; }

    public List<ChecklistItem> getCleanAirChecklist() { return cleanAirChecklist; }
    public void setCleanAirChecklist(List<ChecklistItem> cleanAirChecklist) { this.cleanAirChecklist = cleanAirChecklist; }

    public List<BudgetSolution> getBudgetSolutions() { return budgetSolutions; }
    public void setBudgetSolutions(List<BudgetSolution> budgetSolutions) { this.budgetSolutions = budgetSolutions; }

    public static class ChecklistItem {
        private String id;
        private String category; // cooking, ventilation, household_pollution, dust_management, filtration
        private String title;
        private String description;
        private String costLevel; // "No-cost", "Low-cost", "Moderate", "Premium"
        private boolean completed;

        public ChecklistItem() {}
        public ChecklistItem(String id, String category, String title, String description, String costLevel) {
            this.id = id;
            this.category = category;
            this.title = title;
            this.description = description;
            this.costLevel = costLevel;
            this.completed = false;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getCostLevel() { return costLevel; }
        public void setCostLevel(String costLevel) { this.costLevel = costLevel; }
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }

    public static class BudgetSolution {
        private String tier;
        private String title;
        private String description;
        private String estimatedCost;
        private String efficiencyRating;

        public BudgetSolution() {}
        public BudgetSolution(String tier, String title, String description, String estimatedCost, String efficiencyRating) {
            this.tier = tier;
            this.title = title;
            this.description = description;
            this.estimatedCost = estimatedCost;
            this.efficiencyRating = efficiencyRating;
        }

        public String getTier() { return tier; }
        public void setTier(String tier) { this.tier = tier; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getEstimatedCost() { return estimatedCost; }
        public void setEstimatedCost(String estimatedCost) { this.estimatedCost = estimatedCost; }
        public String getEfficiencyRating() { return efficiencyRating; }
        public void setEfficiencyRating(String efficiencyRating) { this.efficiencyRating = efficiencyRating; }
    }
}
