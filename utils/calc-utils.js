import dayjs from "dayjs";

// GET THE LATEST REPORT
// finds the most recent weather report based on time.
export function latestReport(reports) {
  // clone the reports array to avoid mutating the original
  const list = [...(reports || [])];

  // sort reports by time, newest first
  list.sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf());

  // return the first (latest) report or null if none exist
  return list[0] || null;
}
// HELPER: GET MIN & MAX VALUES
// calculates the minimum and maximum value for a given numeric key in reports
function minMax(list, key) {
  // extract only numeric values for the given key, ignoring invalid data
  const vals = (list || [])
    .map((r) => Number(r[key]))
    .filter((v) => !Number.isNaN(v));

  // if no valid numbers, return nulls
  if (vals.length === 0) return { min: null, max: null };

  // otherwise, return min and max using math fnx
  return {
    min: Math.min(...vals),
    max: Math.max(...vals),
  };
}

// STATION SUMMARY CALCULATOR
// generates a weather summary for a station.
export function stationSummary(reports) {
  // get the most recent report for this station
  const latest = latestReport(reports);

  // build a summary object
  return {
    latest,                                // latest weather report object
    temp: minMax(reports, "temp"),         // min & max temperature
    wind: minMax(reports, "windSpeed"),    // min & max wind speed
    pressure: minMax(reports, "pressure"), // min & max atmospheric pressure
  };
}
