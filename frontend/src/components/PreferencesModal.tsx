import React, { useState } from 'react';
import {
  X,
  Users,
  Briefcase,
  Activity,
  DollarSign,
  Wind,
  ChefHat,
  ShieldAlert,
  CheckCircle2,
  Loader2
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
  const [draft, setDraft] = useState<HouseholdPreferences>(preferences);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync draft when opened
  React.useEffect(() => {
    if (isOpen) {
      setDraft(preferences);
      setSaveSuccess(false);
    }
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const toggleProfile = (p: string) => {
    const next = draft.profiles.includes(p)
      ? draft.profiles.filter((x) => x !== p)
      : [...draft.profiles, p];
    setDraft({ ...draft, profiles: next });
  };

  const profilesList = [
    { id: 'children', label: 'Children (under 14)' },
    { id: 'elderly', label: 'Elderly Individuals (65+)' },
    { id: 'respiratory-sensitive', label: 'Respiratory-Sensitive (Asthma/Allergies)' },
    { id: 'outdoor-workers', label: 'Outdoor Workers' },
    { id: 'fitness-enthusiasts', label: 'Fitness Enthusiasts' },
    { id: 'pets', label: 'Pets (Dogs/Cats)' },
  ];

  const handleSave = () => {
    setSaving(true);
    // Persist to localStorage
    try {
      localStorage.setItem('airaware_preferences', JSON.stringify(draft));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }

    onUpdatePreferences(draft);
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#151B16] border border-[#273128] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#273128]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1B231C] border border-[#344A35] flex items-center justify-center text-[#B7F56A]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F2F5F1]">Household Profile & Preferences</h3>
              <p className="text-xs text-[#9BA69B]">AirAware tailors daily routines and AI advice to your home</p>
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
                const active = draft.profiles.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleProfile(item.id)}
                    className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      active
                        ? 'bg-[#1B231C] border-[#B7F56A] text-[#B7F56A] font-semibold'
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
                  onClick={() => setDraft({ ...draft, budgetPreference: b })}
                  className={`capitalize py-2 rounded-xl text-xs font-semibold border transition-all ${
                    draft.budgetPreference === b
                      ? 'bg-[#B7F56A] border-[#B7F56A] text-[#080B09]'
                      : 'bg-[#101510] border-[#273128] text-[#9BA69B] hover:text-[#F2F5F1]'
                  }`}
                >
                  {b.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Commute Mode */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#9BA69B] flex items-center gap-1.5 mb-2.5">
              <Briefcase className="w-3.5 h-3.5 text-[#B7F56A]" /> Typical Commute Mode
            </label>
            <select
              value={draft.commuteType}
              onChange={(e) => setDraft({ ...draft, commuteType: e.target.value })}
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
                  setDraft({ ...draft, hasAirPurifier: !draft.hasAirPurifier })
                }
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  draft.hasAirPurifier ? 'bg-[#B7F56A]' : 'bg-[#273128]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#080B09] absolute top-1 transition-transform ${
                    draft.hasAirPurifier ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#273128] flex items-center justify-between">
          <span className="text-xs text-[#9BA69B]">
            {saveSuccess && (
              <span className="text-[#65C46D] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Preferences Saved!
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#101510] text-[#9BA69B] hover:text-[#F2F5F1] text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#B7F56A] text-[#080B09] font-bold text-xs hover:bg-[#65C46D] transition-colors flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
