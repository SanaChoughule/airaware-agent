package com.airaware.dto;

import java.util.List;

public class ChatResponse {
    private String reply;
    private List<String> suggestions;
    private List<ActionPill> actionablePills;
    private String healthNotice;

    public ChatResponse() {}
    public ChatResponse(String reply, List<String> suggestions, List<ActionPill> actionablePills, String healthNotice) {
        this.reply = reply;
        this.suggestions = suggestions;
        this.actionablePills = actionablePills;
        this.healthNotice = healthNotice;
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public List<ActionPill> getActionablePills() { return actionablePills; }
    public void setActionablePills(List<ActionPill> actionablePills) { this.actionablePills = actionablePills; }

    public String getHealthNotice() { return healthNotice; }
    public void setHealthNotice(String healthNotice) { this.healthNotice = healthNotice; }

    public static class ActionPill {
        private String label;
        private String type; // e.g., "switch_view", "routine_action", "filter_budget"

        public ActionPill() {}
        public ActionPill(String label, String type) {
            this.label = label;
            this.type = type;
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}
