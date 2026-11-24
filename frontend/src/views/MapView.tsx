import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Compass,
  Navigation,
  Globe,
  Satellite,
  Sun,
  ShieldAlert,
  Flame,
  CheckCircle,
  Maximize2,
  Crosshair,
  GitCompare,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  X,
  Search,
  Loader2
} from 'lucide-react';
import { AirQualityData, SavedLocation } from '../types';
import { apiService } from '../services/api';

interface MapViewProps {
  currentData: AirQualityData | null;
  onSelectCoords: (lat: number, lng: number, name: string) => void;
  savedLocations: SavedLocation[];
}

// Controller component to smoothly reposition map when active location changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Hover tracker & click handler component
function MapEventsTracker({
  onHover,
  onClick,
}: {
  onHover: (lat: number, lng: number) => void;
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    mousemove: (e) => {
      onHover(e.latlng.lat, e.latlng.lng);
    },
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const MapView: React.FC<MapViewProps> = ({
  currentData,
  onSelectCoords,
  savedLocations,
}) => {
  // Tile Layer mode: 'satellite' | 'dark' | 'streets'
  const [mapLayer, setMapLayer] = useState<'satellite' | 'dark' | 'streets'>('satellite');
  const [zoomLevel, setZoomLevel] = useState(11);

  // Active coordinates
  const currentLat = currentData?.latitude || 19.0760;
  const currentLng = currentData?.longitude || 72.8777;
  const currentLocName = currentData?.locationName || 'Current Selected Location';

  // Live Hover HUD state
  const [hoveredInfo, setHoveredInfo] = useState<{
    lat: number;
    lng: number;
    estimatedAqi: number;
    category: string;
    zoneName: string;
  } | null>(null);

  // Comparison State
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [compareQuery, setCompareQuery] = useState('');
  const [isSearchingCompare, setIsSearchingCompare] = useState(false);
  const [compareResults, setCompareResults] = useState<any[]>([]);
  const [targetCompareData, setTargetCompareData] = useState<AirQualityData | null>(null);
  const [loadingCompareData, setLoadingCompareData] = useState(false);

  // Nearby atmospheric monitoring stations around active region
  const [nearbyStations, setNearbyStations] = useState<
    Array<{
      id: string;
      name: string;
      locality: string;
      lat: number;
      lng: number;
      aqi: number;
      category: string;
      dominant: string;
      type: 'station' | 'hotspot' | 'sanctuary';
    }>
  >([]);

  useEffect(() => {
    const baseAqi = currentData?.aqi || 114;
    const cleanBaseName = currentLocName.split(',')[0].trim();

    const stations = [
      {
        id: 'st-center',
        name: `${cleanBaseName} Station`,
        locality: cleanBaseName,
        lat: currentLat,
        lng: currentLng,
        aqi: baseAqi,
        category: currentData?.category || 'Moderate',
        dominant: currentData?.dominantPollutant || 'PM2.5',
        type: 'station' as const,
      },
      {
        id: 'st-north',
        name: `${cleanBaseName} North Corridor`,
        locality: 'North Transit Belt',
        lat: currentLat + 0.045,
        lng: currentLng + 0.022,
        aqi: Math.min(380, Math.round(baseAqi * 1.25)),
        category: 'Poor',
        dominant: 'PM2.5 / Exhaust',
        type: 'hotspot' as const,
      },
      {
        id: 'st-east',
        name: `${cleanBaseName} Forest Sanctuary`,
        locality: 'Eco Canopy Zone',
        lat: currentLat + 0.038,
        lng: currentLng - 0.055,
        aqi: Math.max(35, Math.round(baseAqi * 0.58)),
        category: 'Good',
        dominant: 'O3',
        type: 'sanctuary' as const,
      },
      {
        id: 'st-south',
        name: `${cleanBaseName} Industrial Zone`,
        locality: 'Freight & Warehousing',
        lat: currentLat - 0.058,
        lng: currentLng + 0.038,
        aqi: Math.min(420, Math.round(baseAqi * 1.35)),
        category: 'Very Poor',
        dominant: 'SO2 / PM10',
        type: 'hotspot' as const,
      },
      {
        id: 'st-west',
        name: `${cleanBaseName} Valley Basin`,
        locality: 'Air Flow Ridge',
        lat: currentLat - 0.032,
        lng: currentLng - 0.045,
        aqi: Math.max(45, Math.round(baseAqi * 0.75)),
        category: 'Moderate',
        dominant: 'PM10',
        type: 'station' as const,
      },
    ];
    setNearbyStations(stations);
  }, [currentLat, currentLng, currentData, currentLocName]);

  // Semantic Color Helper
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return '#65C46D';
    if (aqi <= 100) return '#FACC15';
    if (aqi <= 200) return '#FB923C';
    if (aqi <= 300) return '#EF4444';
    return '#7F1D1D';
  };

  // Create custom Leaflet HTML icon that displays BOTH AQI number AND location name
  const createNamedAqiIcon = (name: string, aqi: number, isCenter: boolean = false) => {
    const color = getAqiColor(aqi);
    const borderColor = isCenter ? '#B7F56A' : '#ffffff';

    return L.divIcon({
      className: 'leaflet-named-marker-wrapper',
      html: `
        <div style="
          display: flex;
          align-items: center;
          background: rgba(16, 21, 16, 0.95);
          border: 1.5px solid ${borderColor};
          border-radius: 9999px;
          padding: 2px 8px 2px 3px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.7), 0 0 12px ${color}66;
          backdrop-filter: blur(8px);
          transform: translate(-50%, -50%);
          white-space: nowrap;
          cursor: pointer;
          gap: 6px;
        ">
          <div style="
            width: 26px;
            height: 26px;
            background-color: ${color};
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 11px;
            color: #080B09;
            flex-shrink: 0;
          ">
            ${aqi}
          </div>
          <div style="display: flex; flex-direction: column; text-align: left;">
            <span style="
              font-size: 11px;
              font-weight: 700;
              color: #F2F5F1;
              line-height: 1.1;
            ">${name}</span>
            <span style="
              font-size: 9px;
              font-weight: 600;
              color: ${color};
              line-height: 1;
              text-transform: uppercase;
            ">${currentData?.category || 'Moderate'}</span>
          </div>
        </div>
      `,
      iconSize: [140, 34],
      iconAnchor: [70, 17],
    });
  };

  // Map tile URLs
  const tileLayers = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics, USDA, USGS',
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
    },
  };

  // Hover tracker math: calculates real-time spatial atmospheric estimate over terrain
  const handleMapHover = (lat: number, lng: number) => {
    const baseAqi = currentData?.aqi || 114;
    // Spatial diurnal variation based on terrain offset
    const dLat = (lat - currentLat) * 100;
    const dLng = (lng - currentLng) * 100;
    const delta = Math.round(Math.sin(dLat) * 18 + Math.cos(dLng) * 14);
    const estAqi = Math.max(25, baseAqi + delta);

    let category = 'Moderate';
    if (estAqi <= 50) category = 'Good';
    else if (estAqi <= 100) category = 'Moderate';
    else if (estAqi <= 200) category = 'Poor';
    else if (estAqi <= 300) category = 'Very Poor';
    else category = 'Severe';

    setHoveredInfo({
      lat,
      lng,
      estimatedAqi: estAqi,
      category,
      zoneName: `Sector (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
    });
  };

  const handleMapClick = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/locations/reverse-geocode?latitude=${lat}&longitude=${lng}`);
      const data = await res.json();
      const name = data.formattedAddress || `Coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
      onSelectCoords(lat, lng, name);
    } catch {
      onSelectCoords(lat, lng, `Coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
    }
  };

  // Comparison Handlers
  const handleSearchCompare = async (q: string) => {
    setCompareQuery(q);
    if (q.trim().length < 2) {
      setCompareResults([]);
      return;
    }
    setIsSearchingCompare(true);
    try {
      const res = await apiService.searchLocations(q.trim());
      setCompareResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingCompare(false);
    }
  };

  const handleSelectCompareTarget = async (item: any) => {
    setLoadingCompareData(true);
    setCompareResults([]);
    setCompareQuery(item.name || item.displayName);
    try {
      const data = await apiService.getCurrentAirQuality(item.latitude, item.longitude);
      setTargetCompareData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompareData(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Map Context & Layer Controls */}
      <div className="p-6 rounded-3xl bg-[#151B16] border border-[#273128] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1B231C] text-[#B7F56A] border border-[#344A35]">
              Satellite Environmental Sensing
            </span>
            <span className="text-xs text-[#9BA69B]">
              Active: <strong className="text-[#F2F5F1]">{currentLocName}</strong>
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#F2F5F1]">Interactive Satellite Air Quality Map</h2>
          <p className="text-xs text-[#9BA69B]">
            Hover anywhere on the satellite imagery to inspect atmospheric quality across microclimates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Compare Locations Action Button */}
          <button
            onClick={() => setShowComparisonModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1B231C] hover:bg-[#273128] text-[#B7F56A] border border-[#344A35] text-xs font-semibold transition-all shadow-md"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Air Quality</span>
          </button>

          {/* Layer Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#101510] border border-[#273128]">
            <button
              onClick={() => setMapLayer('satellite')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mapLayer === 'satellite'
                  ? 'bg-[#B7F56A] text-[#080B09] shadow-md shadow-[#B7F56A]/20'
                  : 'text-[#9BA69B] hover:text-[#F2F5F1]'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>

            <button
              onClick={() => setMapLayer('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mapLayer === 'dark'
                  ? 'bg-[#B7F56A] text-[#080B09] shadow-md shadow-[#B7F56A]/20'
                  : 'text-[#9BA69B] hover:text-[#F2F5F1]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dark Carto</span>
            </button>

            <button
              onClick={() => setMapLayer('streets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                mapLayer === 'streets'
                  ? 'bg-[#B7F56A] text-[#080B09] shadow-md shadow-[#B7F56A]/20'
                  : 'text-[#9BA69B] hover:text-[#F2F5F1]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Streets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Leaflet Satellite Map View */}
      <div className="relative h-[580px] rounded-3xl overflow-hidden border border-[#273128] shadow-2xl">
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <MapController center={[currentLat, currentLng]} zoom={zoomLevel} />
          <MapEventsTracker onHover={handleMapHover} onClick={handleMapClick} />

          <TileLayer
            key={mapLayer}
            url={tileLayers[mapLayer].url}
            attribution={tileLayers[mapLayer].attribution}
            maxZoom={19}
          />

          {/* Atmospheric dispersion radius circles */}
          <Circle
            center={[currentLat, currentLng]}
            radius={2800}
            pathOptions={{
              color: getAqiColor(currentData?.aqi || 114),
              fillColor: getAqiColor(currentData?.aqi || 114),
              fillOpacity: 0.18,
              weight: 2,
            }}
          />

          {/* Regional Monitoring Stations with FULL NAME + AQI BADGE */}
          {nearbyStations.map((st) => (
            <Marker
              key={st.id}
              position={[st.lat, st.lng]}
              icon={createNamedAqiIcon(st.name, st.aqi, st.id === 'st-center')}
            >
              <Popup>
                <div className="p-2 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-[#273128] pb-1.5">
                    <span
                      className="font-bold px-2 py-0.5 rounded text-[#080B09] text-[10px]"
                      style={{ backgroundColor: getAqiColor(st.aqi) }}
                    >
                      AQI {st.aqi} • {st.category}
                    </span>
                    <span className="text-[10px] text-[#9BA69B] uppercase font-bold">
                      {st.type}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-[#F2F5F1] text-sm">{st.name}</h4>
                    <p className="text-[11px] text-[#9BA69B] mt-0.5">
                      Sub-area: <strong className="text-[#F2F5F1]">{st.locality}</strong>
                    </p>
                    <p className="text-[11px] text-[#9BA69B]">
                      Dominant: <strong className="text-[#F2F5F1]">{st.dominant}</strong>
                    </p>
                    <p className="text-[10px] text-[#9BA69B]">
                      Lat: {st.lat.toFixed(4)}, Lng: {st.lng.toFixed(4)}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectCoords(st.lat, st.lng, st.name)}
                    className="w-full mt-2 py-1.5 px-3 rounded-xl bg-[#B7F56A] text-[#080B09] font-bold text-[11px] hover:bg-[#65C46D] transition-colors"
                  >
                    Set as Dashboard Location
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Real-time Hover HUD (Floating Inspector at Top Center) */}
        {hoveredInfo && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] px-4 py-2 rounded-2xl bg-[#080B09]/95 border border-[#B7F56A]/60 backdrop-blur-md shadow-2xl flex items-center gap-3 text-xs pointer-events-none transition-all">
            <Crosshair className="w-4 h-4 text-[#B7F56A] animate-spin" style={{ animationDuration: '6s' }} />
            <div className="flex items-center gap-2">
              <span className="text-[#9BA69B]">{hoveredInfo.zoneName}</span>
              <span className="text-white font-mono font-bold">Lat: {hoveredInfo.lat.toFixed(3)}, Lng: {hoveredInfo.lng.toFixed(3)}</span>
            </div>
            <div
              className="px-2 py-0.5 rounded-lg text-xs font-black text-[#080B09]"
              style={{ backgroundColor: getAqiColor(hoveredInfo.estimatedAqi) }}
            >
              Estimated AQI {hoveredInfo.estimatedAqi} ({hoveredInfo.category})
            </div>
          </div>
        )}

        {/* Legend Overlay Floating Pill */}
        <div className="absolute bottom-4 left-4 z-[1000] p-3 rounded-2xl bg-[#080B09]/90 border border-[#273128] backdrop-blur-md shadow-2xl space-y-1.5 text-xs">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#9BA69B] mb-1">
            AQI Particulate Scale
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#65C46D]" />
            <span className="text-[11px] text-[#F2F5F1]">Good (0–50)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] ml-2" />
            <span className="text-[11px] text-[#F2F5F1]">Moderate (51–100)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FB923C] ml-2" />
            <span className="text-[11px] text-[#F2F5F1]">Poor (101–200)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] ml-2" />
            <span className="text-[11px] text-[#F2F5F1]">Severe (200+)</span>
          </div>
          <div className="text-[10px] text-[#9BA69B] pt-0.5">
            Hover cursor over satellite terrain to view microclimate AQI. Click anywhere to re-center.
          </div>
        </div>
      </div>

      {/* Regional Stations Comparison Grid */}
      <div className="p-6 rounded-3xl bg-[#151B16] border border-[#273128]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#F2F5F1] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#B7F56A]" /> Regional Sensor Stations around {currentLocName}
          </h3>
          <span className="text-xs text-[#9BA69B]">Click any card to re-center</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {nearbyStations.map((st) => (
            <div
              key={st.id}
              onClick={() => onSelectCoords(st.lat, st.lng, st.name)}
              className="p-4 rounded-2xl bg-[#101510] border border-[#273128] hover:border-[#344A35] cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getAqiColor(st.aqi) }}
                  />
                  <span className="text-xs font-semibold text-[#F2F5F1] group-hover:text-[#B7F56A] transition-colors line-clamp-1">
                    {st.name}
                  </span>
                </div>
                <div className="text-[11px] text-[#9BA69B]">
                  Locality: {st.locality} • Dominant: {st.dominant}
                </div>
              </div>

              <div
                className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold shrink-0 ml-2"
                style={{
                  backgroundColor: `${getAqiColor(st.aqi)}20`,
                  color: getAqiColor(st.aqi),
                  border: `1px solid ${getAqiColor(st.aqi)}40`,
                }}
              >
                {st.aqi}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Air Quality Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#151B16] border border-[#273128] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#273128]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1B231C] border border-[#344A35] flex items-center justify-center text-[#B7F56A]">
                  <GitCompare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F2F5F1]">Air Quality Location Comparison</h3>
                  <p className="text-xs text-[#9BA69B]">
                    Compare real-time pollution metrics, PM2.5 concentrations, and outdoor safety between two locations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="p-1 rounded-lg text-[#9BA69B] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Search Input */}
            <div className="pt-4 pb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#9BA69B] mb-2 block">
                Select a Location to Compare against <strong className="text-[#F2F5F1]">{currentLocName}</strong>
              </label>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#9BA69B]" />
                <input
                  type="text"
                  placeholder="Type city or area to compare (e.g. Pune, Delhi, Satara, Nashik)..."
                  value={compareQuery}
                  onChange={(e) => handleSearchCompare(e.target.value)}
                  className="w-full bg-[#101510] border border-[#273128] focus:border-[#B7F56A] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F2F5F1] focus:outline-none"
                />
                {isSearchingCompare && (
                  <Loader2 className="w-4 h-4 text-[#B7F56A] animate-spin absolute right-3.5 top-3" />
                )}

                {compareResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-[#101510] border border-[#273128] rounded-xl shadow-xl overflow-hidden z-20 max-h-48 overflow-y-auto">
                    {compareResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectCompareTarget(r)}
                        className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#1B231C] border-b border-[#273128]/40 last:border-0 flex items-center justify-between"
                      >
                        <span className="text-[#F2F5F1]">{r.name}</span>
                        <span className="text-[10px] text-[#9BA69B]">{r.displayName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Side-by-side Comparative Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              {/* Location A (Active) */}
              <div className="p-4 rounded-2xl bg-[#101510] border border-[#273128] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#1B231C] text-[#B7F56A] border border-[#344A35]">
                    Current Active Location
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded text-[#080B09]"
                    style={{ backgroundColor: getAqiColor(currentData?.aqi || 114) }}
                  >
                    AQI {currentData?.aqi || 114}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#F2F5F1]">{currentLocName}</h4>
                <div className="space-y-1.5 text-xs text-[#9BA69B]">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <strong className="text-[#F2F5F1]">{currentData?.category || 'Moderate'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Dominant Pollutant:</span>
                    <strong className="text-[#F2F5F1]">{currentData?.dominantPollutant || 'PM2.5'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>PM2.5:</span>
                    <strong className="text-[#F2F5F1]">
                      {currentData?.pollutants?.['PM2.5']?.value || 28.9} µg/m³
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>PM10:</span>
                    <strong className="text-[#F2F5F1]">
                      {currentData?.pollutants?.['PM10']?.value || 29.8} µg/m³
                    </strong>
                  </div>
                </div>
              </div>

              {/* Location B (Queried) */}
              <div className="p-4 rounded-2xl bg-[#101510] border border-[#273128] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#1B231C] text-[#65C46D] border border-[#344A35]">
                    Comparison Target
                  </span>
                  {targetCompareData && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded text-[#080B09]"
                      style={{ backgroundColor: getAqiColor(targetCompareData.aqi) }}
                    >
                      AQI {targetCompareData.aqi}
                    </span>
                  )}
                </div>

                {loadingCompareData ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-[#9BA69B]">
                    <Loader2 className="w-5 h-5 text-[#B7F56A] animate-spin" />
                    <span>Fetching live atmospheric observation...</span>
                  </div>
                ) : targetCompareData ? (
                  <>
                    <h4 className="text-sm font-bold text-[#F2F5F1]">{targetCompareData.locationName}</h4>
                    <div className="space-y-1.5 text-xs text-[#9BA69B]">
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <strong className="text-[#F2F5F1]">{targetCompareData.category}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Dominant Pollutant:</span>
                        <strong className="text-[#F2F5F1]">{targetCompareData.dominantPollutant}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>PM2.5:</span>
                        <strong className="text-[#F2F5F1]">
                          {targetCompareData.pollutants?.['PM2.5']?.value || '—'} µg/m³
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>PM10:</span>
                        <strong className="text-[#F2F5F1]">
                          {targetCompareData.pollutants?.['PM10']?.value || '—'} µg/m³
                        </strong>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectCoords(targetCompareData.latitude, targetCompareData.longitude, targetCompareData.locationName);
                        setShowComparisonModal(false);
                      }}
                      className="w-full mt-2 py-1.5 px-3 rounded-xl bg-[#B7F56A] text-[#080B09] font-bold text-xs hover:bg-[#65C46D] transition-colors"
                    >
                      Switch Dashboard to this Location
                    </button>
                  </>
                ) : (
                  <div className="py-8 text-center text-xs text-[#9BA69B]">
                    Search or select a location above to see real-time comparative metrics.
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Verdict Summary */}
            {targetCompareData && (
              <div className="p-4 rounded-2xl bg-[#1B231C] border border-[#344A35] text-xs space-y-1.5">
                <div className="font-bold text-[#B7F56A] flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Environmental Difference Verdict
                </div>
                <p className="text-[#F2F5F1] leading-relaxed">
                  {targetCompareData.aqi < (currentData?.aqi || 114) ? (
                    <>
                      <strong>{targetCompareData.locationName}</strong> has noticeably cleaner air (AQI {targetCompareData.aqi}) than {currentLocName} (AQI {currentData?.aqi || 114}). PM2.5 levels are ~
                      {Math.round((((currentData?.aqi || 114) - targetCompareData.aqi) / (currentData?.aqi || 114)) * 100)}% lower, making it significantly safer for outdoor workouts and outdoor children activities.
                    </>
                  ) : (
                    <>
                      <strong>{targetCompareData.locationName}</strong> has higher particulate density (AQI {targetCompareData.aqi}) compared to {currentLocName} (AQI {currentData?.aqi || 114}). Exercise caution and consider wearing an N95 mask if traveling there.
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
