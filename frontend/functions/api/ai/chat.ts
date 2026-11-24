// Cloudflare Pages Function: POST /api/ai/chat
export async function onRequestPost(context: any) {
  const req = await context.request.json();
  const userMsg = req.message || "";
  const activeLoc = req.locationName || "Mumbai, India";
  const aqi = req.currentAqi || 114;
  const env = context.env || {};
  const geminiApiKey = env.GEMINI_API_KEY || "";

  // 1. Detect locations in user query
  const detectedLocations = detectLocations(userMsg);
  let multiLocationContext = "";
  const pills = [
    { label: "View Daily Routine Planner", type: "switch_view" },
    { label: "Check Indoor Recommendations", type: "switch_view" },
  ];

  if (detectedLocations.length > 0) {
    for (const loc of detectedLocations) {
      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
            loc
          )}`,
          { headers: { "User-Agent": "AirAware-Cloudflare-Edge/2.0" } }
        );
        if (nomRes.ok) {
          const locs: any = await nomRes.json();
          if (Array.isArray(locs) && locs.length > 0) {
            const item = locs[0];
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);

            // Fetch live air quality from Open-Meteo
            const omRes = await fetch(
              `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat.toFixed(
                4
              )}&longitude=${lon.toFixed(4)}&current=us_aqi,pm2_5,ozone`
            );
            if (omRes.ok) {
              const omData: any = await omRes.json();
              const cur = omData.current || {};
              const locAqi = cur.us_aqi || Math.round(cur.pm2_5 * 2.5) || 90;
              const cat = getCategory(locAqi);

              multiLocationContext += `\n• ${item.display_name.split(",")[0]}: AQI ${locAqi} (${cat}), PM2.5: ${cur.pm2_5 || 25} µg/m³`;
              pills.unshift({
                label: `Switch to ${item.display_name.split(",")[0]}`,
                type: "switch_location",
              });
            }
          }
        }
      } catch (err) {
        console.error("Multi-loc lookup error:", err);
      }
    }
  }

  // 2. Call Gemini API if env.GEMINI_API_KEY is configured in Cloudflare Pages
  if (geminiApiKey) {
    try {
      const prompt = `You are AirAware AI, an expert environmental health companion.
Active Location: ${activeLoc} (AQI ${aqi})
${multiLocationContext ? `Queried Locations Data:${multiLocationContext}\n` : ""}
User asked: "${userMsg}"
Rules:
1. Rely on measured data. Never fabricate different AQI values.
2. If another city was asked, report its real-time AQI directly.
3. Keep advice actionable, scientifically accurate and concise. Do not give clinical prescriptions.`;

      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      const gRes = await fetch(geminiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (gRes.ok) {
        const gData: any = await gRes.json();
        const replyText =
          gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (replyText) {
          return new Response(
            JSON.stringify({
              reply: replyText,
              suggestions: [
                "When is the best workout window?",
                "How to reduce PM2.5 in bedroom?",
                "Is outdoor running safe?",
              ],
              actionablePills: pills,
              healthNotice:
                "AirAware recommendations are grounded in ambient environmental physics. For acute symptoms, consult a doctor.",
            }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            }
          );
        }
      }
    } catch (err) {
      console.warn("Gemini call error on Edge:", err);
    }
  }

  // Smart fallback response
  let reply = "";
  if (multiLocationContext) {
    reply = `Here is the real-time air quality observation for the location(s) requested:\n${multiLocationContext}\n\nCompared to your active dashboard (${activeLoc} - AQI ${aqi}), check the outdoor activity windows before planning travel or outdoor workouts.`;
  } else {
    reply = generateFallbackReply(userMsg, aqi, activeLoc);
  }

  return new Response(
    JSON.stringify({
      reply,
      suggestions: [
        "Compare air in Pune and Satara",
        "Is it safe for children outside?",
        "Should I buy an air purifier?",
      ],
      actionablePills: pills,
      healthNotice:
        "AirAware provides environmental intelligence. Consult medical specialists for clinical health advice.",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

function detectLocations(query: string): string[] {
  const found: string[] = [];
  const regex =
    /\b(?:in|at|for|around|about|near|compare)\s+([a-zA-Z\s]{3,20})(?:\band\b|\bwith\b|\?|\.|,|$)/gi;
  let match;
  while ((match = regex.exec(query)) !== null) {
    const clean = match[1]
      .replace(
        /(?i)\b(right now|currently|today|yesterday|tomorrow|this evening|air quality|aqi|air)\b/gi,
        ""
      )
      .trim();
    if (clean.length >= 3 && !isStopWord(clean) && !found.includes(clean)) {
      found.push(clean);
    }
  }

  if (found.length === 0 && query.trim().split(/\s+/).length <= 3) {
    const single = query
      .replace(/[?!.,]/g, "")
      .replace(
        /(?i)\b(right now|currently|today|air quality|aqi|air)\b/gi,
        ""
      )
      .trim();
    if (single.length >= 3 && !isStopWord(single)) found.push(single);
  }
  return found;
}

function isStopWord(s: string) {
  const l = s.toLowerCase();
  return (
    l === "air" ||
    l === "air quality" ||
    l === "outside" ||
    l === "walk" ||
    l === "home" ||
    l === "office" ||
    l === "morning" ||
    l === "evening"
  );
}

function getCategory(aqi: number) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 200) return "Poor";
  if (aqi <= 300) return "Very Poor";
  return "Severe";
}

function generateFallbackReply(query: string, aqi: number, loc: string) {
  const q = query.toLowerCase();
  if (q.includes("walk") || q.includes("exercise") || q.includes("run")) {
    return aqi <= 100
      ? `Yes, outdoor activities around ${loc} are safe right now (AQI ${aqi}). The atmosphere is clear with low respiratory stress.`
      : `In ${loc}, outdoor exercise should be moderated today (AQI ${aqi}). Consider scheduling cardio between 1:00 PM and 3:30 PM when diurnal boundary-layer dispersion is highest.`;
  }
  if (q.includes("window") || q.includes("ventilat")) {
    return aqi <= 75
      ? `Great window to ventilate in ${loc} (AQI ${aqi}). Open opposing windows for 20-30 minutes to flush indoor CO2.`
      : `Keep windows sealed during peak traffic hours in ${loc} (AQI ${aqi}). Brief aeration is safer around 2:00 PM.`;
  }
  return `Around ${loc}, the current air quality is ${aqi} (${getCategory(
    aqi
  )}). Focus on indoor particulate filtration, damp wiping surfaces, and planning travel during midday dispersion windows.`;
}
