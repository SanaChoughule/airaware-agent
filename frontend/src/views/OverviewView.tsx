import React from 'react';
import {
  ShieldAlert,
  Wind,
  Clock,
  Sparkles,
  TrendingDown,
  Info,
  ChevronRight,
  Sun
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { AirQualityData } from '../types';

interface OverviewViewProps {
  data: AirQualityData | null;
  loading: boolean;
  onNavigateToPlanner: () => void;
  onNavigateToAssistant: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  data,
  loading,
  onNavigateToPlanner,
  onNavigateToAssistant,
}) => {
  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-3xl bg-[#151B16] border border-[#273128]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#151B16] border border-[#273128]" />
          ))}
        </div>
      </div>
    );
  }

  // Determine Semantic Colors
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return '#65C46D';
    if (aqi <= 100) return '#FACC15';
    if (aqi <= 200) return '#FB923C';
    if (aqi <= 300) return '#EF4444';
    return '#7F1D1D';
  };

  const aqiColor = getAqiColor(data.aqi);

  return (
    <div className="space-y-6">
      {/* Top Banner: Main AQI & Intelligence Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#151B16] via-[#101510] to-[#080B09] border border-[#273128] p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B7F56A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* AQI Circular Gauge & Dominant Marker */}
          <div className="lg:col-span-5 flex flex-col items-center sm:items-start sm:flex-row gap-6">
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  stroke="#1B231C"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="68"
                  stroke={aqiColor}
                  strokeWidth="12"
                  strokeDasharray={427}
                  strokeDashoffset={427 - (Math.min(data.aqi, 400) / 400) * 427}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl md:text-5xl font-black tracking-tighter text-[#F2F5F1]">
                  {data.aqi}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9BA69B] mt-0.5">
                  AQI (US/WHO)
                </span>
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: `${aqiColor}15`,
                  borderColor: `${aqiColor}40`,
                  color: aqiColor,
                }}
              >
                <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: aqiColor }} />
                <span>{data.category}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-[#F2F5F1] tracking-tight">
                {data.locationName}
              </h2>

              <p className="text-xs text-[#9BA69B]">
                Dominant Pollutant: <span className="font-semibold text-[#F2F5F1]">{data.dominantPollutant}</span> • Health Risk: <span className="font-semibold text-[#F2F5F1]">{data.healthRisk}</span>
              </p>

              <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  onClick={onNavigateToPlanner}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B7F56A] hover:bg-[#65C46D] text-[#080B09] font-bold text-xs transition-all shadow-md shadow-[#B7F56A]/10"
                >
                  <span>Routine Schedule</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onNavigateToAssistant}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B231C] hover:bg-[#273128] text-[#B7F56A] border border-[#344A35] font-semibold text-xs transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Assistant</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Intelligence Summary & Best Window Box */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-[#1B231C]/60 border border-[#273128] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B7F56A] mb-2">
                <Sparkles className="w-4 h-4" /> AI Environmental Assessment
              </div>
              <p className="text-xs sm:text-sm text-[#F2F5F1]/90 leading-relaxed">
                {data.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#101510] border border-[#273128] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#151B16] border border-[#273128] flex items-center justify-center text-[#B7F56A] shrink-0">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#9BA69B]">
                    Best Outdoor Window
                  </div>
                  <div className="text-xs font-semibold text-[#F2F5F1] mt-0.5">
                    {data.bestOutdoorWindow}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#101510] border border-[#273128] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#151B16] border border-[#273128] flex items-center justify-center text-[#65C46D] shrink-0">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#9BA69B]">
                    Ventilation Advice
                  </div>
                  <div className="text-xs font-semibold text-[#F2F5F1] mt-0.5">
                    {data.aqi > 150 ? 'Keep Windows Closed' : 'Brief Aeration Safe'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pollutant Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#9BA69B] flex items-center gap-2">
            <Wind className="w-4 h-4 text-[#B7F56A]" /> Measured Pollutant Matrix
          </h3>
          <span className="text-xs text-[#9BA69B]">Real-time telemetry</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(data.pollutants).map(([key, item]) => {
            const isDominant = key === data.dominantPollutant;
            return (
              <div
                key={key}
                className={`p-3.5 rounded-2xl bg-[#151B16] border transition-all hover:border-[#344A35] ${
                  isDominant ? 'border-[#B7F56A]/60 shadow-lg shadow-[#B7F56A]/5' : 'border-[#273128]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#F2F5F1]">{item.name}</span>
                  {isDominant && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#B7F56A]/10 text-[#B7F56A] border border-[#B7F56A]/30">
                      Primary
                    </span>
                  )}
                </div>

                <div className="text-lg font-black text-[#F2F5F1] tracking-tight">
                  {item.value}{' '}
                  <span className="text-[10px] font-normal text-[#9BA69B]">{item.unit}</span>
                </div>

                <div className="mt-2.5">
                  <div className="w-full bg-[#101510] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(item.percentOfStandard, 100)}%`,
                        backgroundColor: item.percentOfStandard > 100 ? '#EF4444' : item.percentOfStandard > 60 ? '#FB923C' : '#65C46D',
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#9BA69B] mt-1">
                    <span>{item.category}</span>
                    <span>{item.percentOfStandard}% Std</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Trend Chart */}
      <div className="p-6 rounded-3xl bg-[#151B16] border border-[#273128]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-[#F2F5F1]">24-Hour Diurnal Air Quality Forecast</h3>
            <p className="text-xs text-[#9BA69B]">Hourly particulate dispersion model with safe workout window markers</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#B7F56A]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B7F56A]" /> Recommended Window
            </span>
            <span className="flex items-center gap-1.5 text-[#9BA69B]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FB923C]" /> Inversion Peak
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.hourlyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B7F56A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#B7F56A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#9BA69B" fontSize={11} tickLine={false} />
              <YAxis stroke="#9BA69B" fontSize={11} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-[#101510] border border-[#273128] shadow-xl text-xs space-y-1">
                        <div className="font-bold text-[#F2F5F1]">{d.time}</div>
                        <div className="text-[#B7F56A] font-semibold">AQI: {d.aqi} ({d.category})</div>
                        <div className="text-[#9BA69B]">PM2.5: {d.pm25} µg/m³</div>
                        {d.isRecommendedWindow && (
                          <div className="text-[10px] text-[#65C46D] font-semibold pt-1">
                            ✓ Ideal outdoor activity window
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="#B7F56A"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#aqiGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
