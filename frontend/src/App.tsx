import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, MobileNav } from './components/Sidebar';
import { PreferencesModal } from './components/PreferencesModal';
import { OverviewView } from './views/OverviewView';
import { PlannerView } from './views/PlannerView';
import { MapView } from './views/MapView';
import { IndoorView } from './views/IndoorView';
import { AssistantView } from './views/AssistantView';
import { ImpactView } from './views/ImpactView';
import {
  AirQualityData,
  DailyPlanResponse,
  HouseholdPreferences,
  SavedLocation,
  IndoorResponse,
  ImpactResponse,
} from './types';
import { apiService } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isPrefOpen, setIsPrefOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Core Context State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 19.0760,
    lng: 72.8777,
  });
  const [locationName, setLocationName] = useState<string>('Mumbai, Maharashtra, India');

  // Household Profile
  const [preferences, setPreferences] = useState<HouseholdPreferences>({
    profiles: ['respiratory-sensitive', 'children'],
    commuteType: 'public_transit',
    exerciseHabit: 'morning_outdoor',
    budgetPreference: 'low-cost',
    hasAirPurifier: true,
    cookingType: 'lpg_well_ventilated',
  });

  // Saved Locations
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([
    { id: '1', name: 'Mumbai, Maharashtra', tag: 'Home', latitude: 19.0760, longitude: 72.8777, aqi: 162 },
    { id: '2', name: 'Satara, Maharashtra', tag: 'Family', latitude: 17.6883, longitude: 74.0041, aqi: 114 },
    { id: '3', name: 'Pune, Maharashtra', tag: 'Office', latitude: 18.5204, longitude: 73.8567, aqi: 114 },
    { id: '4', name: 'Delhi, India', tag: 'Other', latitude: 28.6139, longitude: 77.2090, aqi: 318 },
  ]);

  // Data States
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPlanResponse | null>(null);
  const [indoorAdvice, setIndoorAdvice] = useState<IndoorResponse | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactResponse | null>(null);

  // Completed Action Trackers
  const [completedActions, setCompletedActions] = useState<string[]>(['m1', 'c1']);

  // Loading States
  const [loadingAQI, setLoadingAQI] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingIndoor, setLoadingIndoor] = useState(true);
  const [loadingImpact, setLoadingImpact] = useState(true);

  // Fetch AQI Data
  const loadAQI = async (lat: number, lng: number) => {
    setLoadingAQI(true);
    try {
      const data = await apiService.getCurrentAirQuality(lat, lng);
      setAirQuality(data);
      if (data.locationName && !data.locationName.startsWith('Coordinates')) {
        setLocationName(data.locationName);
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setLoadingAQI(false);
    }
  };

  // Fetch AI Daily Plan
  const loadPlan = async (currentAqi: number, dominant: string) => {
    setLoadingPlan(true);
    try {
      const plan = await apiService.getDailyPlan(
        coords.lat,
        coords.lng,
        locationName,
        currentAqi,
        dominant,
        preferences
      );
      setDailyPlan(plan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlan(false);
    }
  };

  // Fetch Indoor Recommendations
  const loadIndoor = async (currentAqi: number, dominant: string) => {
    setLoadingIndoor(true);
    try {
      const data = await apiService.getIndoorRecommendations(currentAqi, dominant, preferences);
      setIndoorAdvice(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIndoor(false);
    }
  };

  // Fetch Impact
  const loadImpact = async () => {
    setLoadingImpact(true);
    try {
      const data = await apiService.getImpactAnalysis(completedActions);
      setImpactAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingImpact(false);
    }
  };

  // Initial & Coordinate-based Effect
  useEffect(() => {
    let active = true;
    const fetchAll = async () => {
      const data = await loadAQI(coords.lat, coords.lng);
      if (data && active) {
        loadPlan(data.aqi, data.dominantPollutant);
        loadIndoor(data.aqi, data.dominantPollutant);
        loadImpact();
      }
    };
    fetchAll();
    return () => {
      active = false;
    };
  }, [coords.lat, coords.lng]);

  // Re-run plan when household preferences change
  useEffect(() => {
    if (airQuality) {
      loadPlan(airQuality.aqi, airQuality.dominantPollutant);
      loadIndoor(airQuality.aqi, airQuality.dominantPollutant);
    }
  }, [preferences]);

  // Robust Two-tier Live Location Handler (Browser Geolocation -> High-Accuracy IP Fallback)
  const handleUseMyLocation = () => {
    setIsLocating(true);

    const fallbackToIp = async () => {
      try {
        const ipData = await apiService.detectIpLocation();
        if (ipData && ipData.latitude && ipData.longitude) {
          setCoords({ lat: ipData.latitude, lng: ipData.longitude });
          setLocationName(ipData.formattedAddress);
        }
      } catch (err) {
        console.error('IP location fallback error:', err);
      } finally {
        setIsLocating(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          try {
            const rev = await apiService.reverseGeocode(lat, lng);
            if (rev.formattedAddress) setLocationName(rev.formattedAddress);
          } catch (e) {
            console.error(e);
          } finally {
            setIsLocating(false);
          }
        },
        async (error) => {
          console.warn('Browser geolocation denied/timed out; using IP network geolocation fallback:', error.message);
          await fallbackToIp();
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
      );
    } else {
      fallbackToIp();
    }
  };

  const handleSelectCoords = (lat: number, lng: number, name: string) => {
    setCoords({ lat, lng });
    setLocationName(name);
  };

  const handleAddSavedLocation = (name: string, tag: SavedLocation['tag']) => {
    const newLoc: SavedLocation = {
      id: String(Date.now()),
      name,
      tag,
      latitude: coords.lat,
      longitude: coords.lng,
      aqi: airQuality?.aqi,
      category: airQuality?.category,
    };
    setSavedLocations((prev) => [newLoc, ...prev]);
  };

  const handleRemoveSavedLocation = (id: string) => {
    setSavedLocations((prev) => prev.filter((x) => x.id !== id));
  };

  const handleToggleAction = (actionId: string) => {
    setCompletedActions((prev) => {
      const next = prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId];
      apiService.getImpactAnalysis(next).then((res) => setImpactAnalysis(res));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#080B09] text-[#F2F5F1] flex flex-col font-sans">
      {/* Global Header */}
      <Header
        currentLocationName={locationName}
        lastUpdated={airQuality?.lastUpdated || 'Updating...'}
        isSimulated={airQuality?.isSimulated || false}
        onUseMyLocation={handleUseMyLocation}
        onSelectSavedLocation={(loc) => handleSelectCoords(loc.latitude, loc.longitude, loc.name)}
        savedLocations={savedLocations}
        onAddSavedLocation={handleAddSavedLocation}
        onRemoveSavedLocation={handleRemoveSavedLocation}
        onSearchSelect={handleSelectCoords}
        onOpenPreferences={() => setIsPrefOpen(true)}
        isLocating={isLocating}
      />

      {/* Main Container with Sticky Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex pb-16 md:pb-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewView
              data={airQuality}
              loading={loadingAQI}
              onNavigateToPlanner={() => setActiveTab('planner')}
              onNavigateToAssistant={() => setActiveTab('assistant')}
            />
          )}

          {activeTab === 'planner' && (
            <PlannerView
              plan={dailyPlan}
              loading={loadingPlan}
              onRefreshPlan={() => {
                if (airQuality) loadPlan(airQuality.aqi, airQuality.dominantPollutant);
              }}
              onToggleAction={handleToggleAction}
              completedActions={completedActions}
              preferences={preferences}
            />
          )}

          {activeTab === 'map' && (
            <MapView
              currentData={airQuality}
              onSelectCoords={handleSelectCoords}
              savedLocations={savedLocations}
            />
          )}

          {activeTab === 'indoor' && (
            <IndoorView
              indoorData={indoorAdvice}
              loading={loadingIndoor}
              preferences={preferences}
              currentOutdoorAqi={airQuality?.aqi || 120}
            />
          )}

          {activeTab === 'assistant' && (
            <AssistantView
              currentLocationName={locationName}
              currentAqi={airQuality?.aqi || 145}
              dominantPollutant={airQuality?.dominantPollutant || 'PM2.5'}
              preferences={preferences}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onSelectLocation={(locName) => {
                apiService.searchLocations(locName).then((results) => {
                  if (results && results.length > 0) {
                    handleSelectCoords(results[0].latitude, results[0].longitude, results[0].name);
                  }
                });
              }}
            />
          )}

          {activeTab === 'impact' && (
            <ImpactView
              impact={impactAnalysis}
              loading={loadingImpact}
              completedActionCount={completedActions.length}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Household Preferences Modal */}
      <PreferencesModal
        isOpen={isPrefOpen}
        onClose={() => setIsPrefOpen(false)}
        preferences={preferences}
        onUpdatePreferences={(updated) => setPreferences(updated)}
      />
    </div>
  );
}
export default App;
