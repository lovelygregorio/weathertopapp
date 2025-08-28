// nanoid -generates unique IDs for each station (instead of using database IDs)
import { nanoid } from "nanoid";

const _stations = [];


// STATION STORE (CRUD Operations)
export const stationStore = {

  // CREATE A NEW STATION
  async create({ userId, name, lat = null, lng = null }) {
    const station = {
      _id: nanoid(),                     // unique station ID 
      userId: String(userId),           // link station to its owner (always stored as string)
      name: String(name || "").trim(),  // clean station name (remove spaces if any)
      lat: lat === "" ? null : Number(lat), // convert latitude to number or set null
      lng: lng === "" ? null : Number(lng), // convert longitude to number or set null
      createdAt: new Date().toISOString(), // timestamp when station was created
    };

    // save the new station into our in-memory "database"
    _stations.push(station);

    // return the created station so controller can use it
    return station;
  },

  // FIND STATIONS BY USER
  async findByUser(userId) {
    return _stations
      .filter((station) => station.userId === String(userId)) // filter by owner
      .sort((a, b) => a.name.localeCompare(b.name));          // sort alphabetically by name
  },

  // FIND A STATION BY ID
  async findById(id) {
    return _stations.find((station) => station._id === id) || null;
  },

  // DELETE A STATION
  async delete(id) {
    const index = _stations.findIndex((station) => station._id === id);
    if (index !== -1) {
      _stations.splice(index, 1); // Remove station from the array
    }
  },
  // GET ALL STATIONS
  async all() {
    return [..._stations]; // return a copy so no accidentally mutate the original array
  },
};
