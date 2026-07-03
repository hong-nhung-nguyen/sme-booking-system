const express = require("express");
const router = express.Router({ mergeParams: true });

// Joi validation
const appointmentValidation = require("../../validations/tenant/appointment.validation");
const validateMiddleware = require("../../../../middlewares/validateRequest.middleware");
// End Joi validation

const controller = require("../../controllers/tenant/appointment.controller");
const { validate } = require("../../../../models/Appointment.model");

// get all the appointments OR customed queries 
router.get(
    "/", 
    validateMiddleware(appointmentValidation.findAppointmentsSchema),
    controller.index
);

// get one detailed appointment
router.get(
    "/detail/:appointmentId", 
    validateMiddleware(appointmentValidation.findOneAppointmentSchema),
    controller.detail
);

// create a new appointment
router.post(
    "/create", 
    validateMiddleware(appointmentValidation.createAppointmentSchema),
    controller.create
);

// edit an appointment
router.patch(
    "/edit/:appointmentId", 
    validateMiddleware(appointmentValidation.updatedAppointmentSchema),
    controller.edit
);

// delete an appointment
router.delete(
    "/delete/:appointmentId", 
    validateMiddleware(appointmentValidation.deleteAppointmentSchema),
    controller.delete
);

// update status an appointment
router.patch(
    "/change-status/:status/:appointmentId", 
    validateMiddleware(appointmentValidation.changeStatusSchema),
    controller.changeStatus
);

// get an appointment status history
router.get(
    "/status-history/:appointmentId", 
    validateMiddleware(appointmentValidation.findOneAppointmentSchema),
    controller.statusHistory
);

module.exports = router;
