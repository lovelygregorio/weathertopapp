import { stationStore } from "../models/station-store.js";
import { reportStore } from "../models/report-store.js";
import { stationSummary } from "../utils/calc-utils.js";
import { labelFor, iconUrlFor, beaufort, directionLabel, toF } from "../utils/weather-utils.js";

// dashboard controller object
export const dashboardController = {
  async index(req, res) {
    // get the currently logged in user from the session
    const user = req.session.user;
    // find all the weather stations owned by this user
    const stations = await stationStore.findByUser(user._id);


    // will hild all processed data for the dashboard
    const stationCards = [];
    for (const s of stations) {

      // get all wether reports for this station
      const reports = await reportStore.findByStationId(s._id);
     // calculate summary statistic for the station e
      const summary = stationSummary(reports);
      // get the most recent/latest weather report
      const latest = summary.latest;


      // prepare latetst view model for displaying in the UI. if theres at lease on report , extract and format the data
      const latestVM = latest ? {
        code: latest.code,  // weather code from API
        label: labelFor(latest.code), // weather condition label
        icon: latest.icon ? iconUrlFor(latest.icon) : iconUrlFor(latest.code), 
        tempC: latest.temp,
        tempF: toF(latest.temp),
        windBft: beaufort(latest.windSpeed),
        windSpeed: latest.windSpeed,
        windDirLabel: directionLabel(latest.windDir),
        pressure: latest.pressure,
        time: latest.time,
      } : null;

      // build the station card objext with all details
      stationCards.push({
        _id: s._id,  // station ID
        name: s.name, // name
        lat: s.lat, lng: s.lng, // lat, long
        summary, // summary data for graphs/stat
        latest: latestVM, // latest weather report data
      });
    }

    res.render("dashboard-view", {
      title: "WeatherTop Dashboard", // page title
      firstname: user.firstName || "User", // show user's first name if available
      stations: stationCards,   // send processed station data to template
    });
  },
};
