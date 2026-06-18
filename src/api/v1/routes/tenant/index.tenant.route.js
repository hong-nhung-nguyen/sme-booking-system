const express = require("express");
const router = express.Router({ mergeParams: true });

// fixed system variables
const systemConfig = require("../../../../config/system");
const PATH_LOCATION = systemConfig.prefixLocation;
// end fixed system variables 

// import sub-routes
const appointmentRoutes = require("./appointment.route");
const serviceRoutes = require("./service.route");
// end import sub-routes

router.use(PATH_LOCATION + "/appointments", appointmentRoutes);

router.use(PATH_LOCATION + "/services", serviceRoutes);

module.exports = router;
