package com.airaware.dto;

import java.util.List;

public class ImpactAnalysisRequest {
    private List<String> completedActionIds;
    private int daysTracked;

    public ImpactAnalysisRequest() {}

    public List<String> getCompletedActionIds() { return completedActionIds; }
    public void setCompletedActionIds(List<String> completedActionIds) { this.completedActionIds = completedActionIds; }

    public int getDaysTracked() { return daysTracked; }
    public void setDaysTracked(int daysTracked) { this.daysTracked = daysTracked; }
}
