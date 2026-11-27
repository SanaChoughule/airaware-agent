import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  HelpCircle,
  Sparkles,
  Clock,
  ShieldAlert,
  ChevronRight,
  TrendingDown,
  RefreshCw,
  Loader2,
  Check
} from 'lucide-react';
import { DailyPlanResponse, PlanAction, HouseholdPreferences } from '../types';

interface PlannerViewProps {
  plan: DailyPlanResponse | null;
  loading: boolean;
  onRefreshPlan: () => Promise<void> | void;
  onToggleAction: (actionId: string) => void;
  completedActions: string[];
  preferences: HouseholdPreferences;
  locationName?: string;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  plan,
  loading,
  onRefreshPlan,
  onToggleAction,
  completedActions,
  preferences,
  locationName = 'Selected Area',
}) => {
  const [regenerating, setRegenerating] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setSuccessNotice(false);
    try {
      await onRefreshPlan();
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading || !plan) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-3xl bg-[#151B16] border border-[#273128]" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#151B16] border border-[#273128]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Planner Header Summary */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#151B16] to-[#101510] border border-[#273128] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#1B231C] text-[#B7F56A] border border-[#344A35]">
              {plan.riskLevel}
            </span>
            <span className="text-xs text-[#9BA69B]">
              Best Outdoor Window for <strong className="text-[#F2F5F1]">{locationName}</strong>: <strong className="text-[#B7F56A]">{plan.bestOutdoorWindow}</strong>
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#F2F5F1] tracking-tight">
            Daily Routine Adaptive Engine
          </h2>
          <p className="text-xs md:text-sm text-[#9BA69B] max-w-2xl leading-relaxed">
            {plan.dailySummary}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          {successNotice && (
            <span className="text-xs text-[#65C46D] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Routine Updated!
            </span>
          )}
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B231C] hover:bg-[#273128] text-[#B7F56A] border border-[#344A35] text-xs font-semibold self-start md:self-auto transition-all shadow-md disabled:opacity-50"
          >
            {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>{regenerating ? 'Regenerating...' : 'Regenerate Routine'}</span>
          </button>
        </div>
      </div>

      {/* Routine Sections */}
      <div className="space-y-5">
        {plan.routineSections && plan.routineSections.map((section) => (
          <div key={section.timeOfDay} className="p-5 md:p-6 rounded-3xl bg-[#151B16] border border-[#273128]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#273128]">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#1B231C] border border-[#344A35] flex items-center justify-center text-[#B7F56A] text-xs font-bold">
                  {section.timeOfDay[0]}
                </span>
                <div>
                  <h3 className="text-sm md:text-base font-bold text-[#F2F5F1]">{section.title}</h3>
                </div>
              </div>
              <span className="text-xs text-[#9BA69B]">
                {section.actions?.length || 0} action{(section.actions?.length || 0) > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3">
              {section.actions && section.actions.map((act) => {
                const isCompleted = completedActions.includes(act.id);
                return (
                  <div
                    key={act.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-[#101510]/60 border-[#273128] opacity-70'
                        : 'bg-[#1B231C]/60 hover:bg-[#1B231C] border-[#273128]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleAction(act.id)}
                        className="mt-0.5 text-[#B7F56A] hover:text-[#65C46D] transition-colors shrink-0"
                        title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 fill-[#B7F56A]/20" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`text-sm font-semibold ${
                              isCompleted ? 'line-through text-[#9BA69B]' : 'text-[#F2F5F1]'
                            }`}
                          >
                            {act.action}
                          </h4>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              act.priority === 'High'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-[#101510] text-[#9BA69B] border border-[#273128]'
                            }`}
                          >
                            {act.priority} Priority
                          </span>
                        </div>

                        <p className="text-xs text-[#9BA69B] leading-relaxed">
                          <strong>Why:</strong> {act.reason}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div className="p-2 rounded-xl bg-[#101510] border border-[#273128] text-[#9BA69B]">
                            <span className="text-[#B7F56A] font-semibold">Alternative: </span>
                            {act.alternative}
                          </div>
                          <div className="p-2 rounded-xl bg-[#101510] border border-[#273128] text-[#9BA69B]">
                            <span className="text-[#65C46D] font-semibold">Expected Benefit: </span>
                            {act.expectedBenefit}
                          </div>
                        </div>

                        <div className="pt-1 flex items-center justify-between text-[10px] text-[#9BA69B]">
                          <span>Confidence: {act.confidence}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Medical Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#101510] border border-[#273128] text-xs text-[#9BA69B] leading-relaxed flex items-center gap-3">
        <ShieldAlert className="w-4 h-4 text-[#FACC15] shrink-0" />
        <p>{plan.disclaimer}</p>
      </div>
    </div>
  );
};
