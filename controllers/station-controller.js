import "dotenv/config";
import axios from "axios";
import { stationStore } from "../models/station-store.js";
import { reportStore } from "../models/report-store.js";

// utility to calculate station summary (min/max temps, wind, etc.)
import { stationSummary } from "../utils/calc-utils.js";

// weather-related utilities for formatting data
import {
  labelFor,         
  iconUrlFor,      
  beaufort,        
  directionLabel,  
  toF             
} from "../utils/weather-utils.js";

// import function to auto-generate reports using live OpenWeather data
import { autoGenerateForStation } from "./report-controller.js";


// OpenWeather API key from the .env file
const API_KEY = process.env.OPENWEATHER_KEY;

// OpenWeather geocoding endpoint - convert station name to latitude & longitude
const OWM_GEOCODE = "https://api.openweathermap.org/geo/1.0/direct";


// used when a station is created without latitude/longitude.
// calls OpenWeather to find coordinates based on station name.
async function geocodeByName(name) {
  if (!API_KEY || !name) return null;

  try {
    // call OpenWeather geocode API
    const resp = await axios.get(OWM_GEOCODE, {
      params: { q: name, limit: 1, appid: API_KEY },
      timeout: 8000, // 8-second timeout in case API is slow
    });

    // extract the first location match
    const hit = Array.isArray(resp.data) ? resp.data[0] : null;
    if (!hit) return null;

    // return lat/lng as object
    return { lat: hit.lat, lng: hit.lon };
  } catch (err) {
    console.warn("Geocode failed:", err?.message || err);
    return null;
  }
}



// STATION CONTROLLER
export const stationController = {
  

  // VIEW A STATION PAGE
  async index(req, res) {
    const { id } = req.params; // station ID from URL
    const station = await stationStore.findById(id);

    // if station doesn't exist to show 404 page
    if (!station) {
      return res
        .status(404)
        .render("error-view", { title: "Not Found", message: "Station not found." });
    }

    // fetch reports for this station
    let reports = [];
    try {
      if (typeof reportStore.findByStationId === "function") {
        reports = await reportStore.findByStationId(id);
      } else if (Array.isArray(station.reports)) {
        // fallback if station already has reports embedded
        reports = station.reports;
      }
    } catch (e) {
      console.warn("Fetching reports failed:", e?.message || e);
    }

    //get summary stats for this station (min/max/avg values)
    const summary = stationSummary(reports);
    const latest = summary?.latest; // most recent report

    // prepare latest weather view model for template
    const latestVM = latest
      ? {
          code: latest.code,                     
          label: labelFor(latest.code),            
          icon: iconUrlFor(latest.code),            
          tempC: latest.temp,                       
          tempF: toF(latest.temp),                  
          windBft: beaufort(latest.windSpeed),      
          windSpeed: latest.windSpeed,              
          windDirLabel: directionLabel(latest.windDir), 
          pressure: latest.pressure,               
          time: latest.time,                        
        }
      : null;

    // render station page view
    return res.render("station-view", {
      title: station.name,
      station,
      summary,
      latest: latestVM,
      reports,
    });
  },


  // CREATE A NEW STATION
  async createStation(req, res) {
    try {
      const user = req.session.user; // logged-in user info
      if (!user?._id) throw new Error("Not logged in");

      // get and clean up inputs from form
      const nameInput = (req.body.name || "").trim();
      let latInput = (req.body.lat ?? "").toString().trim();
      let lngInput = (req.body.lng ?? "").toString().trim();

      // validate required station name
      if (!nameInput) {
        return res
          .status(400)
          .render("error-view", { title: "Bad Request", message: "Name is required." });
      }

      // if no coordinates provided, attempt to auto-geocode via OpenWeather
      if ((!latInput || !lngInput) && API_KEY) {
        const coords = await geocodeByName(nameInput);
        if (coords) {
          latInput = String(coords.lat);
          lngInput = String(coords.lng);
        }
      }

      // convert lat/lng to numbers (null if invalid)
      const latNum = latInput ? Number(latInput) : null;
      const lngNum = lngInput ? Number(lngInput) : null;

      // Save the new station into the database
      const station = await stationStore.create({
        userId: user._id,
        name: nameInput,
        lat: Number.isFinite(latNum) ? latNum : null,
        lng: Number.isFinite(lngNum) ? lngNum : null,
      });

      // try auto-generating an initial report for the new station
      try {
        if (typeof autoGenerateForStation === "function") {
          await autoGenerateForStation(station._id);
        }
      } catch (e) {
        console.warn("Autogen skipped:", e?.message || e);
      }

      // redirect to dashboard when successful
      return res.redirect("/dashboard");
    } catch (err) {
      console.error("createStation error:", err);
      return res
        .status(500)
        .render("error-view", {
          title: "Create Station Failed",
          message: err?.message || "Unexpected error",
        });
    }
  },


  // DELETE A STATION
  async deleteStation(req, res) {
    const { id } = req.params; // station ID from URL

    try {
      // delete all reports associated with the station first
      if (typeof reportStore.deleteByStation === "function") {
        await reportStore.deleteByStation(id);
      }

      // then delete the station itself
      await stationStore.delete(id);

      return res.redirect("/dashboard");
    } catch (e) {
      console.error("deleteStation error:", e);
      return res
        .status(500)
        .render("error-view", {
          title: "Delete Failed",
          message: e?.message || "Unexpected error",
        });
    }
  },
};
