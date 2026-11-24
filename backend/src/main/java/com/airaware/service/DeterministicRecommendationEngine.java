package com.airaware.service;

import com.airaware.dto.DailyPlanRequest;
import com.airaware.dto.DailyPlanResponse;
import com.airaware.dto.IndoorRecommendationRequest;
import com.airaware.dto.IndoorRecommendationResponse;
import com.airaware.dto.ImpactAnalysisRequest;
import com.airaware.dto.ImpactAnalysisResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DeterministicRecommendationEngine {

    public DailyPlanResponse generatePlan(DailyPlanRequest request) {
        DailyPlanResponse response = new DailyPlanResponse();
        int aqi = request.getCurrentAqi();
        boolean hasSensitive = request.getHouseholdProfiles() != null && (
                request.getHouseholdProfiles().contains("respiratory-sensitive") ||
                request.getHouseholdProfiles().contains("children") ||
                request.getHouseholdProfiles().contains("elderly")
        );
        String budget = request.getBudgetPreference() != null ? request.getBudgetPreference() : "no-cost";

        // Set Risk Level
        if (aqi <= 50) response.setRiskLevel("Low Risk");
        else if (aqi <= 100) response.setRiskLevel("Mild Sensitivity");
        else if (aqi <= 200) response.setRiskLevel(hasSensitive ? "High Risk (Vulnerable Household)" : "Moderate to High Risk");
        else if (aqi <= 300) response.setRiskLevel("Severe Risk");
        else response.setRiskLevel("Hazardous Emergency");

        // Best outdoor window
        response.setBestOutdoorWindow(aqi > 200 ? "Limited / Avoid outdoor cardio today" : "13:00 – 16:00 (Afternoon solar thermal mixing)");

        // Summary
        response.setDailySummary(String.format(
                "Current AQI is %d (%s) with %s as the primary pollutant. %s %s",
                aqi,
                SimulatedAirQualityProvider.getCategoryForAqi(aqi),
                request.getDominantPollutant() != null ? request.getDominantPollutant() : "PM2.5",
                hasSensitive ? "Extra caution active for vulnerable family members." : "Routine schedule adjusted for minimal respiratory load.",
                aqi > 150 ? "Prioritizing indoor activities and HEPA air sealing." : "Good baseline for outdoor errands with planned windows."
        ));

        List<DailyPlanResponse.RoutineSection> sections = new ArrayList<>();

        // Morning
        List<DailyPlanResponse.PlanAction> morningActions = new ArrayList<>();
        if (aqi > 150) {
            morningActions.add(new DailyPlanResponse.PlanAction(
                    "m1", "exercise", "Move morning cardio to indoor yoga or treadmill",
                    "Early morning surface temperature inversion traps heavy " + request.getDominantPollutant() + " near ground level.",
                    "Indoor bodyweight HIIT, pilates, or stationary cycling",
                    "Prevents 60-80% peak pollutant lung deposition",
                    "High", "High (Inversion dynamics + AQI > 150)"
            ));
            morningActions.add(new DailyPlanResponse.PlanAction(
                    "m2", "ventilation", "Keep windows tightly shut during morning rush (7:00 - 10:00 AM)",
                    "Outdoor ambient spike from early vehicular traffic and low wind dispersion.",
                    "Run exhaust fan only in kitchen during preparation",
                    "Keeps indoor particulate count baseline low",
                    "High", "High (Traffic boundary profile)"
            ));
        } else {
            morningActions.add(new DailyPlanResponse.PlanAction(
                    "m1", "exercise", "Outdoor jogging or brisk walk approved before 8:30 AM",
                    "Air quality is currently in an acceptable threshold.",
                    "Stretching in local park away from main arterial highways",
                    "Cardiovascular fitness with low inhalation risk",
                    "Medium", "Moderate (Stable forecast)"
            ));
            morningActions.add(new DailyPlanResponse.PlanAction(
                    "m2", "ventilation", "Natural cross-ventilation for 20 minutes",
                    "Displaces indoor carbon dioxide and moisture accumulated overnight.",
                    "Open opposite facing windows to create a gentle cross-breeze",
                    "Refreshes indoor oxygen levels without significant particulate penalty",
                    "Medium", "High (Ventilation physics)"
            ));
        }
        sections.add(new DailyPlanResponse.RoutineSection("Morning", "Wake Up & Early Activities (06:00 - 09:00)", morningActions));

        // Commute
        List<DailyPlanResponse.PlanAction> commuteActions = new ArrayList<>();
        if ("two_wheeler".equalsIgnoreCase(request.getCommuteType()) || "walking".equalsIgnoreCase(request.getCommuteType())) {
            commuteActions.add(new DailyPlanResponse.PlanAction(
                    "c1", "commute", "Equip an N95/FFP2 respirator mask during transit",
                    "Direct roadside exposure to fine PM2.5 and diesel exhaust particulates.",
                    "Switch to Metro or an AC rideshare vehicle with internal recirculation",
                    "Filters out over 95% of fine exhaust particulates",
                    aqi > 120 ? "High" : "Medium", "High (Roadside particulate sensor data)"
            ));
        } else {
            commuteActions.add(new DailyPlanResponse.PlanAction(
                    "c1", "commute", "Set vehicle ventilation to 'Internal Recirculation' mode",
                    "Prevents sucking in tailpipe exhaust fumes directly from leading vehicles.",
                    "Check and replace cabin pollen/PM2.5 filter if not inspected in 6 months",
                    "Reduces cabin VOC and PM2.5 buildup by up to 70%",
                    "High", "High (Automotive HVAC studies)"
            ));
        }
        sections.add(new DailyPlanResponse.RoutineSection("Commute", "Transit & Travel Exposure (09:00 - 11:00)", commuteActions));

        // Afternoon
        List<DailyPlanResponse.PlanAction> afternoonActions = new ArrayList<>();
        afternoonActions.add(new DailyPlanResponse.PlanAction(
                "a1", "errand", "Schedule unavoidable outdoor errands between 13:00 and 15:30",
                "Afternoon solar heating deepens atmospheric boundary layer, dispersing ground-level particulate matter.",
                "Consolidate multiple short errands into one single trip",
                "Lowest relative particulate density of daylight hours",
                "Medium", "High (Atmospheric diurnal mixing)"
        ));
        sections.add(new DailyPlanResponse.RoutineSection("Afternoon", "Midday & Errands (12:00 - 16:00)", afternoonActions));

        // Evening
        List<DailyPlanResponse.PlanAction> eveningActions = new ArrayList<>();
        if (aqi > 160) {
            eveningActions.add(new DailyPlanResponse.PlanAction(
                    "e1", "family", "Host children's playtime indoors or in filtered community halls",
                    "Evening cooling creates secondary temperature inversion capturing evening traffic smog.",
                    "Interactive board games, indoor badminton, or home reading",
                    "Protects developing children lung alveoli from high oxidative stress",
                    "High", "High (Pediatric environmental health standards)"
            ));
        } else {
            eveningActions.add(new DailyPlanResponse.PlanAction(
                    "e1", "family", "Community walk in green-covered residential lanes",
                    "Urban foliage acts as natural particulate deposition sink away from highways.",
                    "Park walking path with setback from main carriage ways",
                    "Promotes physical activity and mental relaxation",
                    "Low", "Medium (Local vegetation dispersion)"
            ));
        }
        sections.add(new DailyPlanResponse.RoutineSection("Evening", "Dusk, Commute & Leisure (17:00 - 20:00)", eveningActions));

        // Night
        List<DailyPlanResponse.PlanAction> nightActions = new ArrayList<>();
        nightActions.add(new DailyPlanResponse.PlanAction(
                "n1", "indoor", request.isHasAirPurifier() ? "Run bedroom air purifier on Silent/Sleep mode 30 mins before bedtime" : "Damp mop bedroom floors and close balcony doors",
                "Nighttime breathing rate is continuous; closed rooms prevent outdoor particulate seepage while you sleep.",
                "Place a simple wet microfiber towel near door seams if draft is noticeable",
                "Ensures deep, undisturbed restorative sleep without mucosal inflammation",
                "High", "High (Indoor exposure duration model)"
        ));
        sections.add(new DailyPlanResponse.RoutineSection("Night", "Rest & Overnight Recovery (21:00 - 06:00)", nightActions));

        response.setRoutineSections(sections);

        // Sustainability Actions
        List<String> sustain = new ArrayList<>();
        sustain.add("Combined 3 vehicle trips into one coordinated circuit");
        sustain.add("Opted for metro/public transport instead of solo personal car drive");
        sustain.add("Maintained clean indoor air without synthetic chemical aerosol fresheners");
        sustain.add("Zero open-air garden or trash burning reported in vicinity");
        response.setSustainabilityActions(sustain);

        response.setDisclaimer("AirAware guidelines are derived from WHO ambient air standards and environmental physics. For acute respiratory conditions or medical symptoms, consult a qualified healthcare professional.");

        return response;
    }

    public IndoorRecommendationResponse generateIndoorAdvice(IndoorRecommendationRequest request) {
        IndoorRecommendationResponse resp = new IndoorRecommendationResponse();
        int aqi = request.getCurrentOutdoorAqi();

        // Ventilation Guidance
        if (aqi > 200) {
            resp.setVentilationGuidance("Critical: Keep outdoor windows and sliding doors sealed. Atmospheric stagnation is severe outside. Utilize mechanical exhaust fans only in cooking areas and bathrooms to expel localized pollutants.");
        } else if (aqi > 100) {
            resp.setVentilationGuidance("Controlled Ventilation: Avoid opening windows in the morning (7-10 AM) and late evening. Safe tactical aeration is feasible during the afternoon thermal window (1:30 PM - 3:30 PM) for 15-20 minutes.");
        } else {
            resp.setVentilationGuidance("Free Cross-Ventilation: Outdoor air quality is acceptable. Open diagonally positioned windows to maximize natural air exchange and flush indoor VOCs and CO2.");
        }

        // Filtration Guidance
        if (request.isHasPurifier()) {
            resp.setFiltrationGuidance("Optimal Purifier Protocol: Position purifier at least 1.5 feet away from walls in the primary occupied room. Ensure true HEPA (H13) filter is vacuumed on the pre-filter mesh monthly. Maintain medium speed during active hours and silent mode overnight.");
        } else {
            resp.setFiltrationGuidance("Alternative Clean-Air Strategies: Create a clean-air sanctuary bedroom. Implement damp microfiber dusting (dry dusting resuspends PM10), eliminate incense and mosquito coils, and use a Corsi-Rosenthal DIY box fan filter if budget allows.");
        }

        // Checklist items across 5 core categories
        List<IndoorRecommendationResponse.ChecklistItem> checklist = new ArrayList<>();
        checklist.add(new IndoorRecommendationResponse.ChecklistItem("chk_cook_1", "Cooking", "Run kitchen exhaust fan 2 mins prior to lighting stove", "Creates negative air pressure so cooking plumes don't migrate into bedrooms.", "No-cost"));
        checklist.add(new IndoorRecommendationResponse.ChecklistItem("chk_cook_2", "Cooking", "Use lids on pots during frying or high-heat searing", "Retains oil droplets and organic aerosols inside cookware.", "No-cost"));
        checklist.add(new IndoorRecommendationResponse.ChecklistItem("chk_vent_1", "Ventilation", "Seal window frame gaps with foam weatherstripping tape", "Prevents outdoor fine particulate matter infiltration in drafty rooms.", "Low-cost"));
        checklist.add(new IndoorRecommendationResponse.ChecklistItem("chk_vent_2", "Ventilation", "Tactical 15-min airing during lowest daily pollution hour", "Prevents carbon dioxide accumulation without overloading indoor PM levels.", "No-cost"));
        checklist.add(new IndoorRecommendationResponse.ChecklistItem("chk_chem_1", "Household Pollution", "Eliminate mosquito coils & scented paraffin candles", "One burning mosquito coil emits PM2.5 equivalent to 75-100 cigarettes.", "No-cost"));
        checklist.add(new IndoorRecommendationResponse.ChecklistItem("chk_chem_2", "Household Pollution", "Switch to vinegar/water or fragrance-free non-aerosol cleaners", "Aerosol propellants release volatile terpenes that generate secondary organic aerosols.", "No-cost"));
        checklist.add(new IndoorRecommendationResponse.ChecklistItem("chk_dust_1", "Dust Management", "Damp-mop hard floors instead of dry broom sweeping", "Sweeping aerosolizes settled coarse PM10 into breathable height.", "No-cost"));
        checklist.add(new IndoorRecommendationResponse.ChecklistItem("chk_dust_2", "Dust Management", "Wash bed linen weekly in 60°C water", "Neutralizes dust mites and removes settled atmospheric particulate drift.", "No-cost"));
        checklist.add(new IndoorRecommendationResponse.ChecklistItem("chk_filt_1", "Filtration", "Clean and vacuum AC mesh and air purifier pre-filters", "Restores airflow volume and extends expensive HEPA core longevity.", "No-cost"));

        resp.setCleanAirChecklist(checklist);

        // Budget Solutions (No-Cost, Low-Cost, Moderate, Premium)
        List<IndoorRecommendationResponse.BudgetSolution> solutions = new ArrayList<>();
        solutions.add(new IndoorRecommendationResponse.BudgetSolution(
                "No-Cost", "Sanctuary Room Strategy & Wet Mopping",
                "Designate a single tightly-sealed room for sleeping. Damp wipe surfaces daily and keep doors closed to maintain a clean microclimate without spending anything.",
                "$0 / ₹0", "45% indoor PM2.5 reduction"
        ));
        solutions.add(new IndoorRecommendationResponse.BudgetSolution(
                "Low-Cost", "DIY Corsi-Rosenthal Box Fan Filter",
                "A standard 20-inch box fan strapped to MERV 13 furnace filters. Extensively validated by aerosol scientists for high Clean Air Delivery Rate (CADR).",
                "$35 - $60 / ₹2,500 - ₹4,500", "85% indoor PM2.5 reduction"
        ));
        solutions.add(new IndoorRecommendationResponse.BudgetSolution(
                "Moderate", "True HEPA (H13) Room Purifier with Carbon Layer",
                "Dedicated standalone purifier sized for 250-350 sq ft with real-time laser particulate sensor and multi-stage filtration.",
                "$100 - $180 / ₹8,000 - ₹14,000", "99.97% removal down to 0.3 µm"
        ));
        solutions.add(new IndoorRecommendationResponse.BudgetSolution(
                "Premium", "Whole-Home Balanced ERV / HEPA System",
                "Integrated Energy Recovery Ventilator with inline HEPA filtration supplying filtered, tempered fresh outdoor air 24/7 with continuous positive building pressure.",
                "$600+ / ₹45,000+", "Comprehensive complete air management"
        ));

        resp.setBudgetSolutions(solutions);
        return resp;
    }

    public ImpactAnalysisResponse generateImpact(ImpactAnalysisRequest request) {
        ImpactAnalysisResponse response = new ImpactAnalysisResponse();
        int actionCount = request.getCompletedActionIds() != null ? request.getCompletedActionIds().size() : 4;
        int days = Math.max(1, request.getDaysTracked());

        response.setDailyActionScore(Math.min(100, 45 + (actionCount * 12)));
        response.setWeeklyConsistencyScore(Math.min(100, 60 + (days * 6)));

        List<ImpactAnalysisResponse.ImpactItem> items = new ArrayList<>();
        items.add(new ImpactAnalysisResponse.ImpactItem("Switched to Indoor Cardio", "Reduced pollution exposure", "Avoided breathing high volume of winter ambient particulates during peak inversion window.", "Health & Wellness"));
        items.add(new ImpactAnalysisResponse.ImpactItem("Cabin Recirculation Activated", "Reduced pollution exposure", "Mitigated direct roadside diesel PM2.5 infiltration during daily commute.", "Commute Protection"));
        items.add(new ImpactAnalysisResponse.ImpactItem("Strategic 2 PM Airing", "Health-conscious choice", "Exchanged indoor CO2 during solar boundary dispersion without loading indoor particulate count.", "Indoor Air Management"));
        items.add(new ImpactAnalysisResponse.ImpactItem("Eliminated Smudge / Incense", "Reduced emissions", "Prevented substantial indoor VOC and fine particulate spikes within living spaces.", "Clean Home Habits"));
        items.add(new ImpactAnalysisResponse.ImpactItem("Metro / Public Transit Taken", "Reduced emissions", "Replaced single-occupancy vehicle emissions on crowded arterial roadways.", "Sustainable Mobility"));

        response.setImpactHighlights(items);
        response.setQualitativeSummary("Your decisions today protected your household from peak ambient particulate episodes while eliminating key indoor pollution triggers. You've earned a Strong Environmental Stewardship rating for this cycle.");
        response.setMethodologyNote("Impact ratings are qualitative and evidence-aligned based on peer-reviewed environmental health studies and EPA/WHO exposure models, avoiding misleading synthetic carbon credit numbers.");

        return response;
    }
}
