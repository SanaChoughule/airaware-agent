export type PollutantDetail = {
  name: string;
  value: number;
  unit: string;
  category: string;
  percentOfStandard: number;
  explanation: string;
};

export type HourlyForecast = {
  time: string;
  aqi: number;
  category: string;
  pm25: number;
  isRecommendedWindow: boolean;
};

export type AirQualityData = {
  latitude: number;
  longitude: number;
  locationName: string;
  aqi: number;
  category: 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  healthRisk: string;
  dominantPollutant: string;
  summary: string;
  lastUpdated: string;
  isSimulated: boolean;
  pollutants: Record<string, PollutantDetail>;
  hourlyForecast: HourlyForecast[];
  bestOutdoorWindow: string;
};

export type PlanAction = {
  id: string;
  category: string;
  action: string;
  reason: string;
  alternative: string;
  expectedBenefit: string;
  priority: 'High' | 'Medium' | 'Low';
  confidence: string;
  completed?: boolean;
};

export type RoutineSection = {
  timeOfDay: 'Morning' | 'Commute' | 'Afternoon' | 'Evening' | 'Night';
  title: string;
  actions: PlanAction[];
};

export type DailyPlanResponse = {
  dailySummary: string;
  riskLevel: string;
  bestOutdoorWindow: string;
  routineSections: RoutineSection[];
  sustainabilityActions: string[];
  disclaimer: string;
};

export type HouseholdPreferences = {
  profiles: string[];
  commuteType: string;
  exerciseHabit: string;
  budgetPreference: 'no-cost' | 'low-cost' | 'moderate' | 'premium';
  hasAirPurifier: boolean;
  cookingType: string;
};

export type SavedLocation = {
  id: string;
  name: string;
  tag: 'Home' | 'Office' | 'School' | 'Family' | 'Other';
  latitude: number;
  longitude: number;
  aqi?: number;
  category?: string;
};

export type ChatMessage = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  pills?: { label: string; type: string }[];
  healthNotice?: string;
};

export type ChecklistItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  costLevel: string;
  completed: boolean;
};

export type BudgetSolution = {
  tier: string;
  title: string;
  description: string;
  estimatedCost: string;
  efficiencyRating: string;
};

export type IndoorResponse = {
  ventilationGuidance: string;
  filtrationGuidance: string;
  cleanAirChecklist: ChecklistItem[];
  budgetSolutions: BudgetSolution[];
};

export type ImpactHighlight = {
  label: string;
  qualitativeImpact: string;
  description: string;
  category: string;
};

export type ImpactResponse = {
  dailyActionScore: number;
  weeklyConsistencyScore: number;
  impactHighlights: ImpactHighlight[];
  qualitativeSummary: string;
  methodologyNote: string;
};
