import {
  AirQualityData,
  DailyPlanResponse,
  HouseholdPreferences,
  IndoorResponse,
  ImpactResponse,
  ChatMessage,
} from '../types';

const API_BASE = '/api';

export const apiService = {
  async getCurrentAirQuality(lat: number, lng: number): Promise<AirQualityData> {
    const res = await fetch(`${API_BASE}/air-quality/current?latitude=${lat}&longitude=${lng}`);
    if (!res.ok) throw new Error('Failed to fetch air quality');
    return res.json();
  },

  async getForecast(lat: number, lng: number): Promise<AirQualityData> {
    const res = await fetch(`${API_BASE}/air-quality/forecast?latitude=${lat}&longitude=${lng}`);
    if (!res.ok) throw new Error('Failed to fetch forecast');
    return res.json();
  },

  async searchLocations(query: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/locations/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  },

  async reverseGeocode(lat: number, lng: number): Promise<{ formattedAddress: string; locality: string }> {
    const res = await fetch(`${API_BASE}/locations/reverse-geocode?latitude=${lat}&longitude=${lng}`);
    if (!res.ok) throw new Error('Reverse geocode failed');
    return res.json();
  },

  async detectIpLocation(): Promise<{ latitude: number; longitude: number; formattedAddress: string; locality: string }> {
    const res = await fetch(`${API_BASE}/locations/detect-ip`);
    if (!res.ok) throw new Error('IP detection failed');
    return res.json();
  },

  async getDailyPlan(
    lat: number,
    lng: number,
    locationName: string,
    currentAqi: number,
    dominantPollutant: string,
    prefs: HouseholdPreferences
  ): Promise<DailyPlanResponse> {
    const res = await fetch(`${API_BASE}/ai/daily-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: lat,
        longitude: lng,
        locationName,
        currentAqi,
        dominantPollutant,
        householdProfiles: prefs.profiles,
        commuteType: prefs.commuteType,
        exerciseHabit: prefs.exerciseHabit,
        budgetPreference: prefs.budgetPreference,
        hasAirPurifier: prefs.hasAirPurifier,
        cookingType: prefs.cookingType,
      }),
    });
    if (!res.ok) throw new Error('Failed to generate daily plan');
    return res.json();
  },

  async sendChatMessage(
    message: string,
    lat: number,
    lng: number,
    locationName: string,
    currentAqi: number,
    dominantPollutant: string,
    prefs: HouseholdPreferences
  ): Promise<{ reply: string; suggestions: string[]; actionablePills: any[]; healthNotice: string }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        latitude: lat,
        longitude: lng,
        locationName,
        currentAqi,
        dominantPollutant,
        householdProfiles: prefs.profiles,
        budgetPreference: prefs.budgetPreference,
      }),
    });
    if (!res.ok) throw new Error('Failed to send chat message');
    return res.json();
  },

  async getIndoorRecommendations(
    currentOutdoorAqi: number,
    dominantPollutant: string,
    prefs: HouseholdPreferences
  ): Promise<IndoorResponse> {
    const res = await fetch(`${API_BASE}/ai/indoor-recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentOutdoorAqi,
        dominantPollutant,
        householdProfiles: prefs.profiles,
        roomType: 'living_room',
        budgetPreference: prefs.budgetPreference,
        hasPurifier: prefs.hasAirPurifier,
        hasExhaust: true,
      }),
    });
    if (!res.ok) throw new Error('Failed to get indoor advice');
    return res.json();
  },

  async getImpactAnalysis(completedActionIds: string[]): Promise<ImpactResponse> {
    const res = await fetch(`${API_BASE}/ai/impact-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completedActionIds,
        daysTracked: 5,
      }),
    });
    if (!res.ok) throw new Error('Failed to fetch impact analysis');
    return res.json();
  },
};
