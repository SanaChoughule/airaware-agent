import React, { useState, useEffect, useRef } from 'react';
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

  // Track if user explicitly selected a custom named location (so reverse-geocode doesn't overwrite it with a random sub-district/village)
  const isCustomNamedRef = useRef<boolean>(false);

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

  // Unified updater for any selected or detected location
  const updateActiveLocation = async (lat: number, lng: number, explicitName?: string) => {
    setCoords({ lat, lng });
    setLoadingAQI(true);
    setLoadingPlan(true);
    setLoadingIndoor(true);

    if (explicitName && explicitName.trim()) {
      isCustomNamedRef.current = true;
      setLocationName(explicitName);
    } else {
      isCustomNamedRef.current = false;
    }

    try {
      // 1. Fetch live AQI for these exact coordinates
      const aqiData = await apiService.getCurrentAirQuality(lat, lng);
      
      // Keep the user-chosen clean location name if one was provided
      if (explicitName && explicitName.trim()) {
        aqiData.locationName = explicitName;
      } else if (!isCustomNamedRef.current && aqiData.locationName && !aqiData.locationName.startsWith('Coordinates')) {
        setLocationName(aqiData.locationName);
      }
      
      setAirQuality(aqiData);
      setLoadingAQI(false);

      const resolvedName = explicitName || aqiData.locationName || locationName;

      // 2. Fetch AI Daily Plan and Indoor Advice in parallel
      const [plan, indoor] = await Promise.all([
        apiService.getDailyPlan(
          lat,
          lng,
          resolvedName,
          aqiData.aqi,
          aqiData.dominantPollutant,
          preferences
        ),
        apiService.getIndoorRecommendations(
          aqiData.aqi,
          aqiData.dominantPollutant,
          preferences
        ),
      ]);

      setDailyPlan(plan);
      setIndoorAdvice(indoor);
    } catch (e) {
      console.error('Error updating active location:', e);
    } finally {
      setLoadingAQI(false);
      setLoadingPlan(false);
      setLoadingIndoor(false);
    }
  };

  // Initial load on startup
  useEffect(() => {
    updateActiveLocation(coords.lat, coords.lng, locationName);
    apiService.getImpactAnalysis(completedActions).then(setImpactAnalysis).catch(console.error);
  }, []);

  // Re-run plan when household preferences change
  useEffect(() => {
    if (airQuality) {
      apiService
        .getDailyPlan(
          coords.lat,
          coords.lng,
          locationName,
          airQuality.aqi,
          airQuality.dominantPollutant,
          preferences
        )
        .then(setDailyPlan)
        .catch(console.error);

      apiService
        .getIndoorRecommendations(
          airQuality.aqi,
          airQuality.dominantPollutant,
          preferences
        )
        .then(setIndoorAdvice)
        .catch(console.error);
    }
  }, [preferences]);

  // Robust Live Location Detection (Browser GPS -> IP Geolocation Fallback)
  const handleUseMyLocation = () => {
    setIsLocating(true);
    isCustomNamedRef.current = false;

    const fallbackToIp = async () => {
      try {
        const ipData = await apiService.detectIpLocation();
        if (ipData && ipData.latitude && ipData.longitude) {
          const name = ipData.formattedAddress || `${ipData.locality || 'Detected Area'}`;
          await updateActiveLocation(ipData.latitude, ipData.longitude, name);
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
          try {
            const rev = await apiService.reverseGeocode(lat, lng);
            const name = rev.formattedAddress || `Live Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
            await updateActiveLocation(lat, lng, name);
          } catch (e) {
            console.error('Reverse geocode error:', e);
            await updateActiveLocation(lat, lng, `My Coordinates (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
          } finally {
            setIsLocating(false);
          }
        },
        async (error) => {
          console.warn('Browser GPS unavailable/denied, falling back to IP Geolocation:', error.message);
          await fallbackToIp();
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
      );
    } else {
      fallbackToIp();
    }
  };

  const handleSelectCoords = (lat: number, lng: number, name: string) => {
    updateActiveLocation(lat, lng, name);
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
      apiService.getImpactAnalysis(next).then(setImpactAnalysis).catch(console.error);
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
        onSelectSavedLocation={(loc) => updateActiveLocation(loc.latitude, loc.longitude, loc.name)}
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
                if (airQuality) {
                  apiService.getDailyPlan(
                    coords.lat,
                    coords.lng,
                    locationName,
                    airQuality.aqi,
                    airQuality.dominantPollutant,
                    preferences
                  ).then(setDailyPlan);
                }
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
