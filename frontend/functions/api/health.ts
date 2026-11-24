// Cloudflare Pages Function: GET /api/health
export async function onRequestGet() {
  return new Response(
    JSON.stringify({
      status: "UP",
      service: "AirAware Environmental Intelligence Engine",
      runtime: "Cloudflare Serverless Edge Worker",
      liveProvider: "Open-Meteo & OpenStreetMap Nominatim",
      timestamp: Date.now(),
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
