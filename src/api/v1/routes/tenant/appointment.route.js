const express = require("express");
const router = express.Router({ mergeParams: true });

const controller = require("../../controllers/tenant/appointment.controller");

// get all the appointments OR customed queries 
router.get("/", controller.index);

// get one detailed appointment
router.get("/detail/:appointmentId", controller.detail);

// create a new appointment
router.post("/create", controller.create);

// edit an appointment
router.patch("/edit/:appointmentId", controller.edit);

module.exports = router;
