import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  MapPin,
  Home,
  MessageSquareCode,
  ShieldCheck,
  Search,
  Navigation,
  Bookmark,
  Plus,
  Trash2,
  Sliders,
  X,
  Compass,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { SavedLocation } from '../types';

interface HeaderProps {
  currentLocationName: string;
  lastUpdated: string;
  isSimulated: boolean;
  onUseMyLocation: () => void;
  onSelectSavedLocation: (loc: SavedLocation) => void;
  savedLocations: SavedLocation[];
  onAddSavedLocation: (name: string, tag: SavedLocation['tag']) => void;
  onRemoveSavedLocation: (id: string) => void;
  onSearchSelect: (lat: number, lng: number, name: string) => void;
  onOpenPreferences: () => void;
  isLocating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocationName,
  lastUpdated,
  isSimulated,
  onUseMyLocation,
  onSelectSavedLocation,
  savedLocations,
  onAddSavedLocation,
  onRemoveSavedLocation,
  onSearchSelect,
  onOpenPreferences,
  isLocating = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [newTag, setNewTag] = useState<SavedLocation['tag']>('Home');

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/locations/search?query=${encodeURIComponent(val.trim())}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length > 1) {
      e.preventDefault();
      setIsSearching(true);
      try {
        const res = await fetch(`/api/locations/search?query=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data && data.length > 0) {
          handleSelectResult(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSelectResult = (item: any) => {
    onSearchSelect(item.latitude, item.longitude, item.name || item.displayName);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#080B09]/90 backdrop-blur-md border-b border-[#273128] px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Current Pin */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B7F56A] to-[#65C46D] flex items-center justify-center shadow-lg shadow-[#B7F56A]/20">
              <Activity className="w-5 h-5 text-[#080B09] stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-[#F2F5F1] to-[#9BA69B] bg-clip-text text-transparent">
                  AirAware
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1B231C] text-[#B7F56A] border border-[#344A35]">
                  AI Engine
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenPreferences}
              className="p-2 rounded-lg bg-[#151B16] border border-[#273128] text-[#9BA69B] hover:text-[#B7F56A]"
              title="Preferences"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Search & Geolocation */}
        <div className="flex-1 max-w-lg w-full relative">
          <div className="relative flex items-center">
            {isSearching ? (
              <Loader2 className="w-4 h-4 absolute left-3.5 text-[#B7F56A] animate-spin" />
            ) : (
              <Search className="w-4 h-4 absolute left-3.5 text-[#9BA69B]" />
            )}
            <input
              type="text"
              placeholder="Search any city, locality, or district (e.g. Satara, Pune, Delhi)..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#151B16] border border-[#273128] focus:border-[#B7F56A] rounded-xl pl-10 pr-28 py-2 text-sm text-[#F2F5F1] placeholder-[#9BA69B]/60 focus:outline-none transition-all shadow-inner"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                onClick={onUseMyLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#1B231C] text-[#B7F56A] hover:bg-[#344A35]/50 border border-[#344A35] transition-all disabled:opacity-50"
                title="Detect live browser or IP geolocation"
              >
                {isLocating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'My Location'}</span>
              </button>
            </div>
          </div>

          {/* Search Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-[#151B16] border border-[#273128] rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-[#1B231C] border-b border-[#273128]/50 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#B7F56A] shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-[#F2F5F1]">{item.name}</div>
                      <div className="text-xs text-[#9BA69B] line-clamp-1">
                        {item.displayName || `Lat: ${item.latitude.toFixed(2)}, Lng: ${item.longitude.toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                  {item.baseAqi && (
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#101510] text-[#B7F56A] border border-[#273128]">
                      AQI {item.baseAqi}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Location Indicator & Saved Places */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101510] border border-[#273128]">
            <MapPin className="w-4 h-4 text-[#B7F56A] animate-pulse" />
            <div className="text-left">
              <div className="text-xs font-semibold text-[#F2F5F1] truncate max-w-[170px]">
                {currentLocationName}
              </div>
              <div className="text-[10px] text-[#9BA69B] flex items-center gap-1.5">
                <span>{lastUpdated}</span>
                {isSimulated ? (
                  <span className="text-[#FACC15] bg-[#FACC15]/10 px-1 rounded text-[9px]">Simulated</span>
                ) : (
                  <span className="text-[#65C46D] bg-[#65C46D]/10 px-1 rounded text-[9px] font-semibold">Live Feed</span>
                )}
              </div>
            </div>
          </div>

          {/* Saved Locations Menu Trigger */}
          <button
            onClick={() => setShowSavedModal(!showSavedModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151B16] hover:bg-[#1B231C] text-[#F2F5F1] border border-[#273128] text-xs font-medium transition-all"
            title="Saved Locations"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#B7F56A]" />
            <span>Saved ({savedLocations.length})</span>
          </button>

          {/* Preferences Button */}
          <button
            onClick={onOpenPreferences}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151B16] hover:bg-[#1B231C] text-[#9BA69B] hover:text-[#B7F56A] border border-[#273128] text-xs font-medium transition-all"
            title="Household Preferences"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Household</span>
          </button>
        </div>
      </div>

      {/* Saved Locations Dropdown / Modal */}
      {showSavedModal && (
        <div className="absolute right-4 md:right-8 mt-2 w-80 bg-[#151B16] border border-[#273128] rounded-2xl shadow-2xl p-4 z-50">
          <div className="flex items-center justify-between pb-3 border-b border-[#273128]">
            <span className="text-sm font-semibold text-[#F2F5F1] flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#B7F56A]" /> Saved Locations
            </span>
            <button
              onClick={() => setShowSavedModal(false)}
              className="text-[#9BA69B] hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2 space-y-1.5 max-h-56 overflow-y-auto">
            {savedLocations.length === 0 ? (
              <p className="text-xs text-[#9BA69B] py-3 text-center">No saved locations yet.</p>
            ) : (
              savedLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1B231C] group transition-all"
                >
                  <button
                    onClick={() => {
                      onSelectSavedLocation(loc);
                      setShowSavedModal(false);
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#101510] text-[#B7F56A] border border-[#344A35]">
                        {loc.tag}
                      </span>
                      <span className="text-xs font-medium text-[#F2F5F1] truncate max-w-[150px]">
                        {loc.name}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => onRemoveSavedLocation(loc.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#9BA69B] hover:text-red-400 p-1 transition-opacity"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-[#273128] flex items-center gap-2">
            <button
              onClick={() => {
                onAddSavedLocation(currentLocationName, newTag);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#B7F56A] hover:bg-[#65C46D] text-[#080B09] font-bold text-xs transition-colors shadow-md shadow-[#B7F56A]/20"
            >
              <Plus className="w-3.5 h-3.5" /> Save Current Place
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
