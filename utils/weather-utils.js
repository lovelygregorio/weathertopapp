// WEATHER UTILS
export function labelFor(code) {
  const c = Number(code);
  if (Number.isNaN(c)) return "Unknown";        // if code is invalid, return unknown
  if (c >= 200 && c <= 232) return "Thunderstorm"; // thunderstorm range
  if (c >= 300 && c <= 321) return "Drizzle";      // drizzle range
  if (c >= 500 && c <= 531) return "Rain";         // rain range
  if (c >= 600 && c <= 622) return "Snow";         // snow range
  if (c >= 701 && c <= 781) return "Atmosphere";   // mist, fog, haze, smoke, etc.
  if (c === 800) return "Clear";                   // clear sky
  if (c >= 801 && c <= 804) return "Clouds";       // cloudy
  return "Weather";                                // default fallback
}

// map weather code toOpenWeather icon code
export function iconCodeFor(code) {
  const c = Number(code);
  if (Number.isNaN(c)) return "02d";             // default icon if code invalid

  if (c >= 200 && c <= 232) return "11d";        // thunderstorm icon
  if (c >= 300 && c <= 321) return "09d";        // drizzle icon
  if (c >= 500 && c <= 531) return "10d";        // rain icon
  if (c >= 600 && c <= 622) return "13d";        // snow icon
  if (c >= 701 && c <= 781) return "50d";        // fog / haze icon
  if (c === 800) return "01d";                   // clear sky
  if (c === 801) return "02d";                   // few clouds
  if (c === 802) return "03d";                   // scattered clouds
  if (c === 803 || c === 804) return "04d";      // broken / overcast clouds
  return "02d";                                  // default fallback icon
}

// build full OpenWeather icon URL
// returns a complete OpenWeather icon URL.
export function iconUrlFor(codeOrIcon) {
  // if user passes an actual icon code like "10d", use it directly
  if (typeof codeOrIcon === "string" && /^[0-9]{2}[dn]$/.test(codeOrIcon)) {
    return `https://openweathermap.org/img/wn/${codeOrIcon}@2x.png`;
  }
  // otherwise, derive icon code from weather code
  const ic = iconCodeFor(codeOrIcon);
  return `https://openweathermap.org/img/wn/${ic}@2x.png`;
}

// convert Celsius → Fahrenheit
// converts temperature in celsius to fahrenheit.
export function toF(celsius) {
  const c = Number(celsius);
  if (Number.isNaN(c)) return null;
  return Math.round((c * 9 / 5 + 32) * 10) / 10; // rounded to 1 decimal place
}

// convert wind speed (km/h) to beaufort scale
// converts wind speed into beaufort scale (0 - 12)
export function beaufort(kmh) {
  const s = Number(kmh);
  if (Number.isNaN(s)) return null;

  if (s <= 1) return 0;   // calm
  if (s <= 5) return 1;   // light air
  if (s <= 11) return 2;  // light breeze
  if (s <= 19) return 3;  // gentle breeze
  if (s <= 28) return 4;  // moderate breeze
  if (s <= 38) return 5;  // fresh breeze
  if (s <= 49) return 6;  // strong breeze
  if (s <= 61) return 7;  // near gale
  if (s <= 74) return 8;  // gale
  if (s <= 88) return 9;  // strong gale
  if (s <= 102) return 10; // storm
  if (s <= 117) return 11; // violent storm
  return 12;               // hurricane-force winds
}
// convert wind direction to Compass label
export function directionLabel(deg) {
  const d = Number(deg);
  if (Number.isNaN(d)) return null;

  // compass labels in clockwise order
  const dirs = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW",
    "W", "WNW", "NW", "NNW"
  ];

  // calculate which label matches the degree
  const idx = Math.round(((d % 360) / 22.5)) % 16;
  return dirs[idx];
}
