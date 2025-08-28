// import functions from node's built-in modules
import { readFile, writeFile, mkdir } from "fs/promises"; // for file reading/writing
import { dirname, join } from "path"; // for building correct file paths
import { fileURLToPath } from "url"; // for converting module URLs to file paths

const __dirname = dirname(fileURLToPath(import.meta.url));

// paths for storing database JSON file
const DATA_DIR = join(__dirname, "..", "data");   // "../data" folder relative to current file
const DATA_FILE = join(DATA_DIR, "db.json");      // the actual database file

// export a "db" object so other files can import it
export const db = {
  // default structure of the database 
  data: {
    users: [],     // store user records
    stations: [],  // store weather stations data
    reports: [],   // store weather reports
  },

  // read data from db.json file into memory
  async read() {
    try {
      // reading the database file
      const text = await readFile(DATA_FILE, "utf8");
      this.data = JSON.parse(text); // convert JSON text into JS object
    } catch (err) {
      // if the file doesn't exist yet (first run)
      if (err.code === "ENOENT") {
        // create the data directory if missing
        await mkdir(DATA_DIR, { recursive: true });
        // create an empty db.json file with default structure
        await this.write();
      } else {
        // ff any other error happens, throw it
        throw err;
      }
    }
  },

  // write the current data back to db.json
  async write() {
    // make sure data directory exists
    await mkdir(DATA_DIR, { recursive: true });

    // save data to db.json, nicely formatted with indentation
    await writeFile(DATA_FILE, JSON.stringify(this.data, null, 2), "utf8");
  },
};
