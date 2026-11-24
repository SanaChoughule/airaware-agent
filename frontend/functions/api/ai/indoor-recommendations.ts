// Cloudflare Pages Function: POST /api/ai/indoor-recommendations
export async function onRequestPost(context: any) {
  const req = await context.request.json();
  const aqi = req.currentOutdoorAqi || 114;

  let ventilation = "";
  if (aqi > 200) {
    ventilation =
      "Critical: Keep outdoor windows and doors sealed. Atmospheric stagnation is severe outside. Utilize mechanical exhaust fans in cooking areas and bathrooms to expel localized pollutants.";
  } else if (aqi > 100) {
    ventilation =
      "Controlled Ventilation: Avoid opening windows in the morning (7-10 AM) and late evening. Safe tactical aeration is feasible during the afternoon thermal window (1:30 PM - 3:30 PM) for 15-20 minutes.";
  } else {
    ventilation =
      "Free Cross-Ventilation: Outdoor air quality is acceptable. Open diagonally positioned windows to maximize natural air exchange and flush indoor VOCs and CO2.";
  }

  const filtration = req.hasPurifier
    ? "Optimal Purifier Protocol: Position purifier at least 1.5 feet away from walls in the primary occupied room. Ensure true HEPA (H13) filter is vacuumed on the pre-filter mesh monthly."
    : "Alternative Clean-Air Strategies: Create a clean-air sanctuary bedroom. Implement damp microfiber dusting, eliminate incense and mosquito coils, and use a Corsi-Rosenthal DIY box fan filter.";

  const checklist = [
    {
      id: "chk_cook_1",
      category: "Cooking",
      title: "Run kitchen exhaust fan 2 mins prior to lighting stove",
      description:
        "Creates negative air pressure so cooking plumes don't migrate into bedrooms.",
      costLevel: "No-cost",
      completed: false,
    },
    {
      id: "chk_cook_2",
      category: "Cooking",
      title: "Use lids on pots during frying or high-heat searing",
      description: "Retains oil droplets and organic aerosols inside cookware.",
      costLevel: "No-cost",
      completed: false,
    },
    {
      id: "chk_vent_1",
      category: "Ventilation",
      title: "Seal window frame gaps with foam weatherstripping tape",
      description:
        "Prevents outdoor fine particulate matter infiltration in drafty rooms.",
      costLevel: "Low-cost",
      completed: false,
    },
    {
      id: "chk_chem_1",
      category: "Household Pollution",
      title: "Eliminate mosquito coils & scented paraffin candles",
      description:
        "One burning mosquito coil emits PM2.5 equivalent to 75-100 cigarettes.",
      costLevel: "No-cost",
      completed: false,
    },
    {
      id: "chk_dust_1",
      category: "Dust Management",
      title: "Damp-mop hard floors instead of dry broom sweeping",
      description:
        "Sweeping aerosolizes settled coarse PM10 into breathable height.",
      costLevel: "No-cost",
      completed: false,
    },
    {
      id: "chk_filt_1",
      category: "Filtration",
      title: "Clean and vacuum AC mesh and air purifier pre-filters",
      description:
        "Restores airflow volume and extends expensive HEPA core longevity.",
      costLevel: "No-cost",
      completed: false,
    },
  ];

  const budgetSolutions = [
    {
      tier: "No-Cost",
      title: "Sanctuary Room Strategy & Wet Mopping",
      description:
        "Designate a single tightly-sealed room for sleeping. Damp wipe surfaces daily and keep doors closed to maintain a clean microclimate without spending anything.",
      estimatedCost: "$0 / ₹0",
      efficiencyRating: "45% indoor PM2.5 reduction",
    },
    {
      tier: "Low-Cost",
      title: "DIY Corsi-Rosenthal Box Fan Filter",
      description:
        "A standard 20-inch box fan strapped to MERV 13 furnace filters. Extensively validated by aerosol scientists for high Clean Air Delivery Rate (CADR).",
      estimatedCost: "$35 - $60 / ₹2,500 - ₹4,500",
      efficiencyRating: "85% indoor PM2.5 reduction",
    },
    {
      tier: "Moderate",
      title: "True HEPA (H13) Room Purifier with Carbon Layer",
      description:
        "Dedicated standalone purifier sized for 250-350 sq ft with real-time laser particulate sensor and multi-stage filtration.",
      estimatedCost: "$100 - $180 / ₹8,000 - ₹14,000",
      efficiencyRating: "99.97% removal down to 0.3 µm",
    },
    {
      tier: "Premium",
      title: "Whole-Home Balanced ERV / HEPA System",
      description:
        "Integrated Energy Recovery Ventilator with inline HEPA filtration supplying filtered, tempered fresh outdoor air 24/7.",
      estimatedCost: "$600+ / ₹45,000+",
      efficiencyRating: "Comprehensive complete air management",
    },
  ];

  return new Response(
    JSON.stringify({
      ventilationGuidance: ventilation,
      filtrationGuidance: filtration,
      cleanAirChecklist: checklist,
      budgetSolutions,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
