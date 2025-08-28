import "dotenv/config";
import axios from "axios";

// data access layers models for stations and reports
import { stationStore } from "../models/station-store.js";
import { reportStore } from "../models/report-store.js";

// OpenWeather API key from .env
const API_KEY = process.env.OPENWEATHER_KEY;

// OpenWeather endpoints use
const OWM_CURRENT = "https://api.openweathermap.org/data/2.5/weather";  // current conditions
const OWM_GEOCODE = "https://api.openweathermap.org/geo/1.0/direct";    // geocoding: name -> lat/lon

// helper: convert meters/second to km/h with 1 decimal place (m/s × 3.6)
const toKmH = (mps) => Math.round(mps * 3.6 * 10) / 10;

// AUTO-GENERATE A REPORT FOR ONE STATION
// fetches live weather from OpenWeather, creates & saves a report in db

export async function autoGenerateForStation(stationId) {
  //ensure API key
  if (!API_KEY) {
    console.log("Missing OPENWEATHER_KEY in .env");
    return; // stop silently (controller handles UX)
  }
  //load the station record
  const station = await stationStore.findById(stationId);
  if (!station) {
    console.log("No station found for id:", stationId);
    return;
  }
  //try to get coordinates from the station 
  let lat = station.lat;
  let lon = station.lng ?? station.lon; // support either field name

  // if station has no coords, try to geocode by name, eg. Ireland "IE"
  if (!lat || !lon) {
    try {
      const geo = await axios.get(OWM_GEOCODE, {
        params: { q: `${station.name},IE`, limit: 1, appid: API_KEY },
      });

      const hit = Array.isArray(geo.data) ? geo.data[0] : null;
      if (!hit) {
        console.log("Could not find location for:", station.name);
        return;
      }
      lat = hit.lat;
      lon = hit.lon;
    } catch (e) {
      console.log("Geocoding failed:", e?.message || e);
      return;
    }
  }
  //call OpenWeather current weather for these coords
  let data;
  try {
    const resp = await axios.get(OWM_CURRENT, {
      params: { lat, lon, units: "metric", appid: API_KEY },
    });
    data = resp.data;
  } catch (e) {
    console.log("Weather fetch failed:", e?.message || e);
    return;
  }
  //safely extract fields from the API response
  const wx = data?.weather?.[0] || {}; // first weather condition object
  const main = data?.main || {};       // temps/pressure
  const wind = data?.wind || {};       // wind data

  // normalize values for our report schema
  const code = wx.id ?? null;                            // numeric weather code
  const icon = wx.icon ?? null;                          
  const temp = typeof main.temp === "number" ? main.temp : null; 
  const pressure = typeof main.pressure === "number" ? main.pressure : null; 
  const windSpeed = typeof wind.speed === "number" ? toKmH(wind.speed) : null; 
  const windDir = typeof wind.deg === "number" ? wind.deg : null;
  
  // save a new report for this station
  await reportStore.create({
    stationId,
    code,
    temp,
    windSpeed,
    windDir,
    pressure,
    icon,                               
    time: new Date().toISOString(),     
  });
}

// REPORT CONTROLLER 
// manual create (from form), Delete,  auto-generate (button/action)
export const reportController = {
  // Create a report from user input (form POST)
  async createReport(req, res) {
    try {
      const { id } = req.params; // station id from URL
      const { code, temp, windSpeed, windDir, pressure } = req.body;

      await reportStore.create({
        stationId: id,
        code,
        temp,
        windSpeed,
        windDir,
        pressure,
        time: new Date().toISOString(),
      });

      // after creating, go back to the station page
      res.redirect(`/station/${id}`);
    } catch (err) {
      console.error("createReport error:", err);
      res.status(500).render("error-view", {
        title: "Create Report Failed",
        message: err?.message || "Unexpected error",
      });
    }
  },

  // delete a single report by its id
  async deleteReport(req, res) {
    try {
      const { id, reportId } = req.params; // stationId, reportId
      await reportStore.delete(reportId);
      res.redirect(`/station/${id}`);
    } catch (err) {
      console.error("deleteReport error:", err);
      res.status(500).render("error-view", {
        title: "Delete Report Failed",
        message: err?.message || "Unexpected error",
      });
    }
  },

  // auto-generate a report by fetching live data (uses the function above)
  async autoGenerateReport(req, res) {
    const stationId = req.params.id;
    try {
      await autoGenerateForStation(stationId);
      res.redirect(`/station/${stationId}`);
    } catch (err) {
      console.error("Auto-generate failed:", err?.message || err);
      res.redirect(`/station/${stationId}?error=autogen`);
    }
  },
};
