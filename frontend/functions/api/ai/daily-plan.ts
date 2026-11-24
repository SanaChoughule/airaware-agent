// Cloudflare Pages Function: POST /api/ai/daily-plan
export async function onRequestPost(context: any) {
  const req = await context.request.json();
  const aqi = req.currentAqi || 114;
  const dominant = req.dominantPollutant || "PM2.5";
  const profiles = req.householdProfiles || [];
  const hasSensitive =
    profiles.includes("respiratory-sensitive") ||
    profiles.includes("children") ||
    profiles.includes("elderly");

  let riskLevel = "Mild Sensitivity";
  if (aqi <= 50) riskLevel = "Low Risk";
  else if (aqi <= 100) riskLevel = "Mild Sensitivity";
  else if (aqi <= 200)
    riskLevel = hasSensitive
      ? "High Risk (Vulnerable Household)"
      : "Moderate to High Risk";
  else if (aqi <= 300) riskLevel = "Severe Risk";
  else riskLevel = "Hazardous Emergency";

  const dailySummary = `Current AQI is ${aqi} (${getCategory(
    aqi
  )}) with ${dominant} as the primary pollutant. ${
    hasSensitive
      ? "Extra caution active for vulnerable family members."
      : "Routine schedule adjusted for minimal respiratory load."
  } ${
    aqi > 150
      ? "Prioritizing indoor activities and HEPA air sealing."
      : "Good baseline for outdoor errands with planned windows."
  }`;

  const morningActions = [
    aqi > 150
      ? {
          id: "m1",
          category: "exercise",
          action: "Move morning cardio to indoor yoga or treadmill",
          reason: `Early morning surface temperature inversion traps heavy ${dominant} near ground level.`,
          alternative: "Indoor bodyweight HIIT, pilates, or stationary cycling",
          expectedBenefit: "Prevents 60-80% peak pollutant lung deposition",
          priority: "High",
          confidence: "High (Inversion dynamics + AQI > 150)",
        }
      : {
          id: "m1",
          category: "exercise",
          action: "Outdoor jogging or brisk walk approved before 8:30 AM",
          reason: "Air quality is currently in an acceptable threshold.",
          alternative: "Stretching in local park away from main arterial highways",
          expectedBenefit: "Cardiovascular fitness with low inhalation risk",
          priority: "Medium",
          confidence: "Moderate (Stable forecast)",
        },
    {
      id: "m2",
      category: "ventilation",
      action:
        aqi > 150
          ? "Keep windows shut during morning rush (7:00 - 10:00 AM)"
          : "Natural cross-ventilation for 20 minutes",
      reason:
        aqi > 150
          ? "Outdoor ambient spike from early vehicular traffic and low wind dispersion."
          : "Displaces indoor carbon dioxide and moisture accumulated overnight.",
      alternative: "Run exhaust fan only in kitchen during cooking",
      expectedBenefit: "Maintains optimal indoor oxygen balance",
      priority: aqi > 150 ? "High" : "Medium",
      confidence: "High",
    },
  ];

  const commuteActions = [
    {
      id: "c1",
      category: "commute",
      action:
        req.commuteType === "two_wheeler" || req.commuteType === "walking"
          ? "Equip an N95/FFP2 respirator mask during transit"
          : "Set vehicle ventilation to 'Internal Recirculation' mode",
      reason:
        "Direct roadside exposure to fine PM2.5 and diesel exhaust particulates.",
      alternative:
        "Switch to Metro or an AC rideshare vehicle with internal recirculation",
      expectedBenefit: "Filters out over 70-95% of fine exhaust particulates",
      priority: aqi > 120 ? "High" : "Medium",
      confidence: "High (Roadside particulate sensor data)",
    },
  ];

  const afternoonActions = [
    {
      id: "a1",
      category: "errand",
      action: "Schedule outdoor errands between 13:00 and 15:30",
      reason:
        "Afternoon solar heating deepens atmospheric boundary layer, dispersing ground-level particulate matter.",
      alternative: "Consolidate multiple short errands into one single trip",
      expectedBenefit: "Lowest relative particulate density of daylight hours",
      priority: "Medium",
      confidence: "High (Atmospheric diurnal mixing)",
    },
  ];

  const eveningActions = [
    {
      id: "e1",
      category: "family",
      action:
        aqi > 160
          ? "Host children's playtime indoors or in filtered community halls"
          : "Community walk in green-covered residential lanes",
      reason:
        "Evening cooling creates secondary temperature inversion capturing evening traffic smog.",
      alternative: "Interactive board games, indoor badminton, or home reading",
      expectedBenefit:
        "Protects developing children lung alveoli from high oxidative stress",
      priority: aqi > 160 ? "High" : "Low",
      confidence: "High",
    },
  ];

  const nightActions = [
    {
      id: "n1",
      category: "indoor",
      action: req.hasAirPurifier
        ? "Run bedroom air purifier on Silent/Sleep mode 30 mins before bedtime"
        : "Damp mop bedroom floors and close balcony doors",
      reason:
        "Nighttime breathing rate is continuous; closed rooms prevent outdoor particulate seepage while sleeping.",
      alternative: "Place a damp microfiber towel near door seams if drafty",
      expectedBenefit: "Ensures deep, undisturbed restorative sleep",
      priority: "High",
      confidence: "High",
    },
  ];

  const responseObj = {
    dailySummary,
    riskLevel,
    bestOutdoorWindow:
      aqi > 200
        ? "Limited / Avoid outdoor cardio today"
        : "13:00 – 16:00 (Afternoon solar thermal mixing)",
    routineSections: [
      {
        timeOfDay: "Morning",
        title: "Wake Up & Early Activities (06:00 - 09:00)",
        actions: morningActions,
      },
      {
        timeOfDay: "Commute",
        title: "Transit & Travel Exposure (09:00 - 11:00)",
        actions: commuteActions,
      },
      {
        timeOfDay: "Afternoon",
        title: "Midday & Errands (12:00 - 16:00)",
        actions: afternoonActions,
      },
      {
        timeOfDay: "Evening",
        title: "Dusk, Commute & Leisure (17:00 - 20:00)",
        actions: eveningActions,
      },
      {
        timeOfDay: "Night",
        title: "Rest & Overnight Recovery (21:00 - 06:00)",
        actions: nightActions,
      },
    ],
    sustainabilityActions: [
      "Combined 3 vehicle trips into one coordinated circuit",
      "Opted for metro/public transit instead of solo personal car drive",
      "Maintained clean indoor air without synthetic chemical aerosol fresheners",
    ],
    disclaimer:
      "AirAware guidelines are derived from WHO ambient air standards and environmental physics. For acute respiratory conditions, consult a healthcare professional.",
  };

  return new Response(JSON.stringify(responseObj), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function getCategory(aqi: number) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 200) return "Poor";
  if (aqi <= 300) return "Very Poor";
  return "Severe";
}
