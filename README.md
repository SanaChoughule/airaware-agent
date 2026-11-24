# AirAware — AI-Powered Urban Air Quality Assistant

AirAware is an environmental wellness and urban intelligence web platform designed to transform real-time ambient particulate data into personalized, actionable daily routines.

---

## 🌟 Key Highlights & Architecture

1. **Deterministic Environmental Intelligence & WHO-Aligned Safety Guardrails**
   - Diurnal atmospheric boundary layer dispersion modeling.
   - Ground-level particulate dynamics (PM2.5, PM10, O3, NO2, SO2, CO).
   - Strict medical disclaimer adherence; no fabricated emission offset numbers or clinical diagnoses.

2. **Google Gemini LLM Integration**
   - Natural language companion grounded in real physical telemetry.
   - Context-aware daily morning summaries tailored to household vulnerabilities and lifestyle constraints.
   - Dual-mode architecture: Runs seamlessly with zero setup via deterministic fallback engine when API keys are omitted.

3. **Modern Dark-Mode Dashboard Design**
   - Color Palette: Deep obsidian (`#080B09`), card base (`#151B16`), and crisp bio-lime green (`#B7F56A`).
   - SVG Circular AQI dynamic visual gauge.
   - 24-hour diurnal trend forecast chart using Recharts.
   - Multi-category Clean Air Home Checklist with DIY budget tiers (including Corsi-Rosenthal Box guidelines).

4. **Multi-Location & Geolocation Intelligence**
   - Browser Geolocation API integration with coordinate reverse-geocoding.
   - Instant search across cities, areas, and urban landmarks.
   - Saved locations system (Home, Office, Family, School).
   - Multi-station interactive spatial map with hotspot visualizations.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Java 17, Spring Boot 3 (Spring Web, WebFlux RestClient, Validation, Jackson).
- **AI**: Google Gemini API with fallback inference engine.

---

## 🚀 Running the Project

### 1. Backend (Spring Boot 3 / Java 17)
```bash
cd backend
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home  # or your JDK 17 path
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`.

### 2. Frontend (Vite / React / TypeScript)
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173` with automatic reverse proxy configured for `/api` calls.

---

## 🔑 Environment Configuration (.env)

Refer to `.env.example`:
```ini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
GOOGLE_AIR_QUALITY_API_KEY=
GOOGLE_MAPS_API_KEY=
AIRAWARE_DEMO_MODE=true
```
*Note: If no API keys are provided, AirAware operates in deterministic high-fidelity Demo Mode.*
