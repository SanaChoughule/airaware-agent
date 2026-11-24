import React, { useState } from 'react';
import {
  Home,
  Wind,
  CheckCircle2,
  Circle,
  ShieldCheck,
  Sparkles,
  DollarSign,
  AlertTriangle,
  Flame,
  Layers,
  Sparkle
} from 'lucide-react';
import { IndoorResponse, ChecklistItem, HouseholdPreferences } from '../types';

interface IndoorViewProps {
  indoorData: IndoorResponse | null;
  loading: boolean;
  preferences: HouseholdPreferences;
  currentOutdoorAqi: number;
}

export const IndoorView: React.FC<IndoorViewProps> = ({
  indoorData,
  loading,
  preferences,
  currentOutdoorAqi,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (loading || !indoorData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-3xl bg-[#151B16] border border-[#273128]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 rounded-3xl bg-[#151B16] border border-[#273128]" />
          <div className="h-64 rounded-3xl bg-[#151B16] border border-[#273128]" />
        </div>
      </div>
    );
  }

  const filteredChecklist =
    activeCategory === 'all'
      ? indoorData.cleanAirChecklist
      : indoorData.cleanAirChecklist.filter(
          (c) => c.category.toLowerCase() === activeCategory.toLowerCase()
        );

  return (
    <div className="space-y-6">
      {/* Indoor Ambient Intelligence Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#151B16] to-[#101510] border border-[#273128] space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1B231C] text-[#B7F56A] border border-[#344A35]">
            Indoor Sanctuary Engine
          </span>
          <span className="text-xs text-[#9BA69B]">
            Outdoor Reference AQI: <strong className="text-[#F2F5F1]">{currentOutdoorAqi}</strong>
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-[#F2F5F1] tracking-tight">
          Indoor Air Quality Management & Clean Home Protocol
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#101510] border border-[#273128]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#B7F56A] uppercase tracking-wider mb-1.5">
              <Wind className="w-4 h-4" /> Strategic Aeration
            </div>
            <p className="text-xs text-[#9BA69B] leading-relaxed">
              {indoorData.ventilationGuidance}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#101510] border border-[#273128]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#65C46D] uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-4 h-4" /> Filtration & Air Cleaning
            </div>
            <p className="text-xs text-[#9BA69B] leading-relaxed">
              {indoorData.filtrationGuidance}
            </p>
          </div>
        </div>
      </div>

      {/* Clean Air Home Checklist */}
      <div className="p-6 rounded-3xl bg-[#151B16] border border-[#273128]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#273128]">
          <div>
            <h3 className="text-base font-bold text-[#F2F5F1]">Personalized Clean Air Home Checklist</h3>
            <p className="text-xs text-[#9BA69B]">
              Actionable, scientific steps to neutralize indoor smoke, particulate resuspension, and chemical VOCs
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['all', 'Cooking', 'Ventilation', 'Household Pollution', 'Dust Management', 'Filtration'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    activeCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-[#B7F56A] text-[#080B09] font-bold border-[#B7F56A]'
                      : 'bg-[#101510] text-[#9BA69B] border-[#273128] hover:text-[#F2F5F1]'
                  }`}
                >
                  {cat === 'all' ? 'All Actions' : cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* Checklist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredChecklist.map((item) => {
            const isDone = checkedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isDone
                    ? 'bg-[#101510]/60 border-[#273128] opacity-75'
                    : 'bg-[#1B231C]/60 hover:bg-[#1B231C] border-[#273128]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-[#B7F56A] shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 fill-[#B7F56A]/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#9BA69B]" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#101510] text-[#9BA69B] border border-[#273128]">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-semibold text-[#B7F56A]">
                        {item.costLevel}
                      </span>
                    </div>
                    <h4
                      className={`text-xs font-semibold ${
                        isDone ? 'line-through text-[#9BA69B]' : 'text-[#F2F5F1]'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#9BA69B] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tiered Budget Solutions */}
      <div className="p-6 rounded-3xl bg-[#151B16] border border-[#273128]">
        <div className="mb-6">
          <h3 className="text-base font-bold text-[#F2F5F1]">Evidence-Based Clean Air Budget Tiers</h3>
          <p className="text-xs text-[#9BA69B]">
            From zero-dollar behavioral changes to HEPA filtration hardware
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indoorData.budgetSolutions.map((sol, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#101510] border border-[#273128] flex flex-col justify-between space-y-4 hover:border-[#344A35] transition-all"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1B231C] text-[#B7F56A] border border-[#344A35]">
                  {sol.tier}
                </span>
                <h4 className="text-sm font-bold text-[#F2F5F1]">{sol.title}</h4>
                <p className="text-xs text-[#9BA69B] leading-relaxed">{sol.description}</p>
              </div>

              <div className="pt-3 border-t border-[#273128] space-y-1">
                <div className="text-xs font-semibold text-[#F2F5F1]">{sol.estimatedCost}</div>
                <div className="text-[10px] text-[#65C46D] font-medium">{sol.efficiencyRating}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
