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

// delete an appointment
router.delete("/delete/:appointmentId", controller.delete);

// update status an appointment
router.patch("/change-status/:status/:appointmentId", controller.changeStatus);

// get an appointment status history
router.get("/status-history/:appointmentId", controller.statusHistory);

module.exports = router;
