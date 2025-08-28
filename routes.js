import express from "express";

import { aboutController } from "./controllers/about-controller.js";
import { accountController } from "./controllers/account-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { stationController } from "./controllers/station-controller.js";
import { reportController } from "./controllers/report-controller.js";
import { forecastController } from "./controllers/forecast-controller.js";

export const router = express.Router(); //  define and export router first

// helper: fail-fast wrapper for missing handlers
const ensure = (fn, name) => (req, res, next) => {
  if (typeof fn !== "function") {
    throw new Error(
      `Route handler "${name}" is not a function (got ${typeof fn}). Check your imports/exports.`
    );
  }
  return fn(req, res, next);
};

// auth guard 
const requireAuth = (req, res, next) => {
  if (!req.session?.user) return res.redirect("/login");
  next();
};

// ---------- home routes ----------
router.get("/", (req, res) =>
  req.session?.user ? res.redirect("/dashboard") : res.redirect("/login")
);

router.get("/about", ensure(aboutController.index, "aboutController.index"));

router.get("/signup", ensure(accountController.showSignup, "accountController.showSignup"));
router.post("/signup", ensure(accountController.signup, "accountController.signup"));

router.get("/login", ensure(accountController.showLogin, "accountController.showLogin"));
router.post("/login", ensure(accountController.login, "accountController.login"));
router.get("/logout", ensure(accountController.logout, "accountController.logout"));

// ---------- account routes ----------
router.get("/account", requireAuth, ensure(accountController.settings, "accountController.settings"));
router.post("/account/update", requireAuth, ensure(accountController.update, "accountController.update"));

// ---------- dashboard ----------
router.get("/dashboard", requireAuth, ensure(dashboardController.index, "dashboardController.index"));

// ---------- station routes ----------
router.post("/station", requireAuth, ensure(stationController.createStation, "stationController.createStation"));
router.get("/station/:id", requireAuth, ensure(stationController.index, "stationController.index"));
router.post("/station/:id/delete", requireAuth, ensure(stationController.deleteStation, "stationController.deleteStation"));

// ---------- report routes ----------
router.post("/station/:id/report", requireAuth, ensure(reportController.createReport, "reportController.createReport"));
router.post(
  "/station/:id/report/:reportId/delete",
  requireAuth,
  ensure(reportController.deleteReport, "reportController.deleteReport")
);
router.post(
  "/station/:id/autogen",
  requireAuth,
  ensure(reportController.autoGenerateReport, "reportController.autoGenerateReport")
);

// ---------- forecast routes  ----------
router.get(
  "/station/:id/forecast",
  requireAuth,
  ensure(forecastController.forecast, "forecastController.forecast")
);

// ---------- 404 Page ----------
router.use((req, res) =>
  res.status(404).render("error-view", {
    title: "Not Found",
    message: "Route not found."
  })
);

