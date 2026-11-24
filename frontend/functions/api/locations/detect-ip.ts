// Cloudflare Pages Function: GET /api/locations/detect-ip
export async function onRequestGet(context: any) {
  const request = context.request;
  const cf = request.cf || {};

  // Cloudflare provides ultra-accurate native geo headers on every edge request!
  const city = cf.city || "Mumbai";
  const region = cf.region || "Maharashtra";
  const country = cf.country || "India";
  const latitude = cf.latitude ? parseFloat(cf.latitude) : 19.0760;
  const longitude = cf.longitude ? parseFloat(cf.longitude) : 72.8777;

  return new Response(
    JSON.stringify({
      latitude,
      longitude,
      formattedAddress: `${city}, ${region}, ${country}`,
      locality: city,
      source: "Cloudflare Edge Geolocation",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
