import { nanoid } from "nanoid";
// temporary storage for reports. in a real app, this would be replaced by a database.
const _reports = [];

// HELPER FUNCTIONS 
// safely converts a value into a number or returns null. handles empty strings, undefined, and invalid numbers
function toNumberOrNull(value) {
  if (value === "" || value === undefined || value === null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null; // return number if valid, else null
}
// returns a valid ISO timestamp.if `t` is provided, return it as a string.if not, return the current date/time.
function timeOrNow(t) {
  return t ? String(t) : new Date().toISOString();
}

// REPORT STORE (CRUD Operations)
export const reportStore = {

 
  // CREATE A NEW REPORT
  async create({ stationId, code, temp, windSpeed, windDir, pressure, time, icon = null }) {
    const report = {
      _id: nanoid(),                          // unique report ID
      stationId: String(stationId),          // station ID 
      code: toNumberOrNull(code),            // weather code
      temp: toNumberOrNull(temp),            // temperature 
      windSpeed: toNumberOrNull(windSpeed),  // wind speed 
      windDir: toNumberOrNull(windDir),      // wind direction 
      pressure: toNumberOrNull(pressure),    // atmospheric pressure
      time: timeOrNow(time),                 // time of report 
      icon,                                 // weather icon code from API
    };

    // save the report in memory
    _reports.push(report);

    return report; // return the created report
  },


  // FIND ALL REPORTS FOR A STATION
  async findByStationId(stationId) {
    return _reports
      .filter((r) => r.stationId === String(stationId))          // get reports for station
      .sort((a, b) => new Date(b.time) - new Date(a.time));      // sort by most recent
  },


  // DELETE A SINGLE REPORT
  async delete(reportId) {
    const idx = _reports.findIndex((r) => r._id === reportId);
    if (idx >= 0) _reports.splice(idx, 1); // remove report if found
  },

  // DELETE ALL REPORTS FOR A STATION
  async deleteByStation(stationId) {
    // loop backwards to safely delete while iterating
    for (let i = _reports.length - 1; i >= 0; i--) {
      if (_reports[i].stationId === String(stationId)) {
        _reports.splice(i, 1); // remove matching report
      }
    }
  },
};
