import "dotenv/config";
import axios from "axios";
import { stationStore } from "../models/station-store.js";

// get the OpenWeather API key from the .env file
const API_KEY = process.env.OPENWEATHER_KEY;

// base URLs for OpenWeather API 
const CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// helper.build full icon URLs for OpenWeather icons
const getIconUrl = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

// convert wind speed from meters/second to kilometers/hour
const toKmH = (ms) => Math.round(ms * 3.6);


// FORECAST CONTROLLER
export const forecastController = {
  async forecast(req, res) {
    try {
     
      // VALIDATE API KEY
   
      if (!API_KEY) {
        throw new Error(
          "Missing OpenWeather API key. Please set OPENWEATHER_KEY in .env file."
        );
      }

      // GET STATION DETAILS

      const { id } = req.params;
      const station = await stationStore.findById(id);

      // If station doesn't exist, show an error page
      if (!station) {
        return res.status(404).render("error-view", {
          title: "Station Not Found",
          message: "We could not find the requested weather station.",
        });
      }

      // extract coordinates from the station data
      const lat = station.lat;
      const lon = station.lng ?? station.lon; // Support both lng or lon

      if (!lat || !lon) {
        throw new Error("Missing station coordinates");
      }

      // FETCH CURRENT WEATHER DATA
      const currentWeatherRes = await axios.get(CURRENT_WEATHER_URL, {
        params: { lat, lon, appid: API_KEY, units: "metric" },
      });

      const currentData = currentWeatherRes.data;
      const weatherInfo = currentData.weather?.[0] || {}; // First weather condition

      // build a "current weather" object for the view
      const current = {
        temp: Math.round(currentData.main.temp),                // current temperature
        feels: Math.round(currentData.main.feels_like),         // ceels-like temperature 
        desc: weatherInfo.description || "",                    // weather description
        icon: weatherInfo.icon || "",                           // icon code from API
        iconUrl: weatherInfo.icon ? getIconUrl(weatherInfo.icon) : "", // icon image URL
        wind: currentData.wind?.speed ? toKmH(currentData.wind.speed) : null, // wind speed
        windDeg: currentData.wind?.deg,                         // wind direction 
        pressure: currentData.main.pressure,                    // air pressure
        humidity: currentData.main.humidity,                    // humidity 
      };

     
      // FETCH 5 DAY / 3-HOURLY FORECAST DATA
      const forecastRes = await axios.get(FORECAST_URL, {
        params: { lat, lon, appid: API_KEY, units: "metric" },
      });

      const forecastList = forecastRes.data.list || [];

      // PREPARE HOURLY FORECAST (Next 16 x 3h ≈ 48h) FREE VERSION
      const hourly = forecastList.slice(0, 16).map((f) => {
        const wx = f.weather?.[0] || {};
        return {
          time: f.dt_txt,                                    // forecast time (YYYY-MM-DD HH:mm)
          temp: Math.round(f.main.temp),                     // temperature 
          pop: f.pop ? Math.round(f.pop * 100) : 0,          // probability of precipitation 
          icon: wx.icon || "",                               // icon code
          iconUrl: wx.icon ? getIconUrl(wx.icon) : "",       // full icon URL
          desc: wx.description || "",                        // weather description
        };
      });

      // PREPARE DAILY FORECAST (Next 5 Days)
      const dailyMap = {};

      forecastList.forEach((f) => {
        const date = f.dt_txt.split(" ")[0]; // Extract YYYY-MM-DD

        // if this date doesn't exist in dailyMap, create it
        if (!dailyMap[date]) {
          dailyMap[date] = {
            tmin: Infinity,                     // track lowest temp
            tmax: -Infinity,                    // track highest temp
            icon: f.weather[0].icon,            // use first icon of the day
            desc: f.weather[0].description,     // use first description of the day
            pop: 0,                             // probability of precipitation
            count: 0,                           // number of data points for averaging
          };
        }

        // update min & max temperatures for the day
        dailyMap[date].tmin = Math.min(dailyMap[date].tmin, f.main.temp_min);
        dailyMap[date].tmax = Math.max(dailyMap[date].tmax, f.main.temp_max);

        // sum up precipitation probabilities
        dailyMap[date].pop += f.pop || 0;
        dailyMap[date].count += 1;
      });

      // convert the map into an array and prepare data for the view
      const daily = Object.entries(dailyMap)
        .slice(0, 8) // Limit to 8 days
        .map(([date, d]) => ({
          date,
          tmin: Math.round(d.tmin),
          tmax: Math.round(d.tmax),
          pop: Math.round((d.pop / d.count) * 100), // average precipitation %
          icon: d.icon,
          iconUrl: getIconUrl(d.icon),
          desc: d.desc,
        }));

      // RENDER FORECAST VIEW
      return res.render("forecast-view", {
        title: `${station.name} Forecast`,
        station,                         // station details
        timezone: forecastRes.data.city.timezone || "", // station timezone if available
        lat,
        lon,
        current,                         // current weather object
        hourlyJson: JSON.stringify(hourly), // hourly forecast as JSON for charts
        dailyJson: JSON.stringify(daily),   // daily forecast as JSON for charts
      });

    } catch (err) {
  
      // HANDLE ERRORS

      console.error("Forecast error:", err?.response?.data || err.message);

      return res.status(500).render("error-view", {
        title: "Forecast Error",
        message:
          err?.response?.data?.message ||
          err.message ||
          "Failed to fetch weather forecast. Please try again later.",
      });
    }
  },
};
