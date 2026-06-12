const express = require("express");
const router = express.Router({ mergeParams: true });

const appointmentRoutes = require("./appointment.route");
const serviceRoutes = require("./service.route");

router.use("/locations/:locationId/appointments", appointmentRoutes);

router.use("/locations/:locationId/services", serviceRoutes);

module.exports = router;
