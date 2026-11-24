// Cloudflare Pages Function: GET /api/locations/reverse-geocode?latitude=...&longitude=...
export async function onRequestGet(context: any) {
  const url = new URL(context.request.url);
  const lat = parseFloat(url.searchParams.get("latitude") || "19.0760");
  const lng = parseFloat(url.searchParams.get("longitude") || "72.8777");

  try {
    const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(revUrl, {
      headers: {
        "User-Agent": "AirAware-Cloudflare-Edge/2.0",
      },
    });

    if (res.ok) {
      const data: any = await res.json();
      const addr = data.address || {};
      const place =
        addr.suburb || addr.neighbourhood || addr.city || addr.town || "";
      const city = addr.city || addr.county || "";
      const state = addr.state || "";

      let formatted = data.display_name;
      if (place && city && place !== city) {
        formatted = `${place}, ${city}`;
      } else if (city && state) {
        formatted = `${city}, ${state}`;
      } else if (place) {
        formatted = place;
      }

      return new Response(
        JSON.stringify({
          latitude: lat,
          longitude: lng,
          formattedAddress: formatted,
          locality: city || place || "Local Area",
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  } catch (err) {
    console.error("Reverse geocode error:", err);
  }

  return new Response(
    JSON.stringify({
      latitude: lat,
      longitude: lng,
      formattedAddress: `Coordinates (${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E)`,
      locality: "Local Area",
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
