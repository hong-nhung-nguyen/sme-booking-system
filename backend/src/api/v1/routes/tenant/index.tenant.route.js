const express = require("express");
const router = express.Router({ mergeParams: true });

// import sub-routes
const appointmentRoutes = require("./appointment.route");
const serviceRoutes = require("./service.route");
const locationRoutes = require("./location.route");
const floorplanRoutes = require("./floorplan.route");
// end import sub-routes

router.use("/appointments", appointmentRoutes);

// Mounted before the parameterised location routes so "/locations" is not
// swallowed by "/locations/:locationId".
router.use("/locations", locationRoutes);

router.use("/services", serviceRoutes);

router.use("/locations/:locationId/floorplans", floorplanRoutes);

module.exports = router;
