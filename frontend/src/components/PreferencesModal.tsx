import React from 'react';
import {
  X,
  Users,
  Briefcase,
  Activity,
  DollarSign,
  Wind,
  ChefHat,
  ShieldAlert
} from 'lucide-react';
import { HouseholdPreferences } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: HouseholdPreferences;
  onUpdatePreferences: (updated: HouseholdPreferences) => void;
}

export const PreferencesModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
}) => {
  if (!isOpen) return null;

  const toggleProfile = (p: string) => {
    const next = preferences.profiles.includes(p)
      ? preferences.profiles.filter((x) => x !== p)
      : [...preferences.profiles, p];
    onUpdatePreferences({ ...preferences, profiles: next });
  };

  const profilesList = [
    { id: 'children', label: 'Children (under 14)' },
    { id: 'elderly', label: 'Elderly Individuals (65+)' },
    { id: 'respiratory-sensitive', label: 'Respiratory-Sensitive (Asthma/Allergies)' },
    { id: 'outdoor-workers', label: 'Outdoor Workers' },
    { id: 'fitness-enthusiasts', label: 'Fitness Enthusiasts' },
    { id: 'pets', label: 'Pets (Dogs/Cats)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#151B16] border border-[#273128] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#273128]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1B231C] border border-[#344A35] flex items-center justify-center text-[#B7F56A]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F2F5F1]">Household Profile & Lifestyle</h3>
              <p className="text-xs text-[#9BA69B]">AirAware tailors daily safety advice to your home</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#9BA69B] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-6 text-sm">
          {/* Sensitive Members */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#9BA69B] flex items-center gap-1.5 mb-2.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#B7F56A]" /> Household Members & Vulnerabilities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {profilesList.map((item) => {
                const active = preferences.profiles.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleProfile(item.id)}
                    className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      active
                        ? 'bg-[#1B231C] border-[#B7F56A] text-[#B7F56A]'
                        : 'bg-[#101510] border-[#273128] text-[#9BA69B] hover:text-[#F2F5F1]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Preference */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#9BA69B] flex items-center gap-1.5 mb-2.5">
              <DollarSign className="w-3.5 h-3.5 text-[#B7F56A]" /> Solution Budget Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['no-cost', 'low-cost', 'moderate', 'premium'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => onUpdatePreferences({ ...preferences, budgetPreference: b })}
                  className={`capitalize py-2 rounded-xl text-xs font-semibold border transition-all ${
                    preferences.budgetPreference === b
                      ? 'bg-[#B7F56A] border-[#B7F56A] text-[#080B09]'
                      : 'bg-[#101510] border-[#273128] text-[#9BA69B] hover:text-[#F2F5F1]'
                  }`}
                >
                  {b.replace('-', ' ')}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#9BA69B] mt-1.5">
              AirAware prioritizes DIY, behavioral shifts, and affordable actions before expensive purchases.
            </p>
          </div>

          {/* Commute Mode */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#9BA69B] flex items-center gap-1.5 mb-2.5">
              <Briefcase className="w-3.5 h-3.5 text-[#B7F56A]" /> Typical Commute Mode
            </label>
            <select
              value={preferences.commuteType}
              onChange={(e) => onUpdatePreferences({ ...preferences, commuteType: e.target.value })}
              className="w-full bg-[#101510] border border-[#273128] rounded-xl px-3 py-2 text-xs text-[#F2F5F1] focus:outline-none focus:border-[#B7F56A]"
            >
              <option value="public_transit">Public Transit (Metro / Bus)</option>
              <option value="car_ac">Car with AC Recirculation</option>
              <option value="two_wheeler">Two-Wheeler (Motorcycle / Scooter)</option>
              <option value="walking">Bicycle / Walking</option>
              <option value="remote">Work from Home (No Commute)</option>
            </select>
          </div>

          {/* Home Equipment */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#9BA69B] flex items-center gap-1.5 mb-2.5">
              <Wind className="w-3.5 h-3.5 text-[#B7F56A]" /> Clean Air Equipment
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#101510] border border-[#273128]">
              <div>
                <span className="text-xs font-medium text-[#F2F5F1]">True HEPA Air Purifier in Home</span>
                <p className="text-[11px] text-[#9BA69B]">Enables purifier runtime schedules and filter alerts</p>
              </div>
              <button
                onClick={() =>
                  onUpdatePreferences({ ...preferences, hasAirPurifier: !preferences.hasAirPurifier })
                }
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  preferences.hasAirPurifier ? 'bg-[#B7F56A]' : 'bg-[#273128]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#080B09] absolute top-1 transition-transform ${
                    preferences.hasAirPurifier ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#273128] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#B7F56A] text-[#080B09] font-bold text-xs hover:bg-[#65C46D] transition-colors"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
