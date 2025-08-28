import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { engine } from "express-handlebars";
import { router } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const candidates = [
  path.join(__dirname, ".env"),     
  path.join(process.cwd(), ".env"), 
  path.resolve(".env"),             
];

let loadedFrom = null;
for (const p of candidates) {
  const exists = fs.existsSync(p);
  console.log(`[env] probe: ${p} exists=${exists}`);
  if (!exists) continue;
  const result = dotenv.config({ path: p, override: true });
  if (!result.error) {
    loadedFrom = p;
    break;
  }
}
if (!loadedFrom) {
  const fallback = dotenv.config();
  if (!fallback.error) loadedFrom = "(dotenv default lookup)";
}
console.log(`[env] loaded from: ${loadedFrom || "NONE"}`);
console.log(
  `[env] OPENWEATHER_KEY loaded? ${!!process.env.OPENWEATHER_KEY} ${
    (process.env.OPENWEATHER_KEY || "").slice(-6)
      ? "(..." + (process.env.OPENWEATHER_KEY || "").slice(-6) + ")"
      : ""
  }`
);


const app = express();

// body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// make session available in views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// handlebars
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: {
      eq: (a, b) => a === b,
      json: (v) => JSON.stringify(v),
    },
  })
);
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

// static assets
app.use(express.static(path.join(__dirname, "public")));

// set DEV_AUTOLOGIN
if (String(process.env.DEV_AUTOLOGIN).toLowerCase() === "true") {
  app.use((req, res, next) => {
    if (!req.session.user) req.session.user = { _id: "dev-user-1", firstName: "Lovely" };
    next();
  });
}

// routes
app.use("/", router);

// error handler
app.use((err, req, res, next) => {
  console.error("[server:error]", err);
  if (res.headersSent) return next(err);
  res.status(500).render("error-view", { title: "Server Error", message: err?.message || "Unexpected error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`WeatherTop running on http://localhost:${PORT}`);
});
