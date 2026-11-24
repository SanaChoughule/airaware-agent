import React from 'react';
import {
  Award,
  ShieldCheck,
  TrendingUp,
  Leaf,
  CheckCircle2,
  Info,
  Car,
  Wind,
  Smile,
  Zap
} from 'lucide-react';
import { ImpactResponse } from '../types';

interface ImpactViewProps {
  impact: ImpactResponse | null;
  loading: boolean;
  completedActionCount: number;
}

export const ImpactView: React.FC<ImpactViewProps> = ({
  impact,
  loading,
  completedActionCount,
}) => {
  if (loading || !impact) {
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

  return (
    <div className="space-y-6">
      {/* Impact Score Hero Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#151B16] via-[#101510] to-[#080B09] border border-[#273128] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#B7F56A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1B231C] text-[#B7F56A] border border-[#344A35]">
              Personal Sustainability & Exposure Reduction
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#F2F5F1] tracking-tight">
              My Environmental Wellness & Community Footprint
            </h2>
            <p className="text-xs md:text-sm text-[#9BA69B] leading-relaxed">
              {impact.qualitativeSummary}
            </p>
          </div>

          <div className="md:col-span-4 flex items-center justify-around gap-4 p-4 rounded-2xl bg-[#101510] border border-[#273128]">
            <div className="text-center">
              <div className="text-3xl font-black text-[#B7F56A] tracking-tight">
                {impact.dailyActionScore}
                <span className="text-sm font-normal text-[#9BA69B]">/100</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9BA69B] mt-1">
                Daily Score
              </div>
            </div>

            <div className="h-10 w-[1px] bg-[#273128]" />

            <div className="text-center">
              <div className="text-3xl font-black text-[#65C46D] tracking-tight">
                {impact.weeklyConsistencyScore}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9BA69B] mt-1">
                Consistency
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Actions & Qualitative Outcomes */}
      <div className="p-6 rounded-3xl bg-[#151B16] border border-[#273128]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#273128]">
          <div>
            <h3 className="text-base font-bold text-[#F2F5F1]">Proactive Environmental Actions Log</h3>
            <p className="text-xs text-[#9BA69B]">
              Scientific qualitative classifications instead of unverified speculative offsets
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-[#101510] text-[#B7F56A] border border-[#344A35]">
            {completedActionCount} Habits Completed Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {impact.impactHighlights.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#101510] border border-[#273128] flex items-start gap-3.5 hover:border-[#344A35] transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-[#151B16] border border-[#273128] flex items-center justify-center text-[#B7F56A] shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1B231C] text-[#65C46D] border border-[#344A35]">
                    {item.qualitativeImpact}
                  </span>
                  <span className="text-[10px] text-[#9BA69B]">{item.category}</span>
                </div>

                <h4 className="text-xs font-bold text-[#F2F5F1]">{item.label}</h4>
                <p className="text-[11px] text-[#9BA69B] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology & Evidence Note */}
      <div className="p-4 rounded-2xl bg-[#101510] border border-[#273128] flex items-start gap-3 text-xs text-[#9BA69B] leading-relaxed">
        <Info className="w-4 h-4 text-[#B7F56A] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#F2F5F1]">Scientific Methodology Note: </strong>
          {impact.methodologyNote}
        </div>
      </div>
    </div>
  );
};
