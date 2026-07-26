const appointmentService = require("../../../../services/tenant/appointment.service");
const googleCalendarService = require("../../../../services/googleCalendar.service");
const clientService = require("../../../../services/client/client.service");
const { listenerCount } = require("../../../../models/AppointmentStatusHistory.schema");

// [GET] api/v1/business/appointments
module.exports.index = async (req, res, next) => {
    try {
        // Find all appointments 
        const appointments = await appointmentService.findForUser(req.user, req.query);

        if (appointments.length > 0) {
            return res.status(200).json({
                message: "Appointments found",
                appointments: appointments
            })
        };

        return res.status(200).json({
            message: "No booking found",
            "appointments": [],
        });

    } catch(error) {
        next(error);
    }
};

// [GET] api/v1/business/appointments/detail/:appointmentId
module.exports.detail = async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId;

        const record = await appointmentService.findOneForUser(req.user, appointmentId);

        if (record) {
            return res.status(200).json({
                message: "appointment found",
                data: record
            })
        };

        return res.status(404).json({
            message: "No appointment found"
        });

    } catch(error) {
        next(error);
    }
};

// [POST] api/v1/business/appointments/create
module.exports.create = async (req, res, next) => {
    try {
        // const { businessId, locationId } = req.params;
        const businessId = req.user.businessId;

        if (!req.body) {
            return res.status(400).json({
                message: "Missing request body"
            });
        }

        const {
            locationId,
            clientFirstName,
            clientLastName = "",
            clientPhone = "",
            clientEmail = "",
            serviceId,
            date,
            startTime,
            durationMins,
            resourceId,
            partySize,
            channel,
            createdBy
        } = req.body;

        // find existing client >< otherwise, create a new client

        const clientObject = {
            businessId: businessId,
            firstName: clientFirstName,
            ...(clientLastName && { lastName: clientLastName }),
            ...(clientEmail && { email: clientEmail }),
            ...(clientPhone && { phone: clientPhone })
        };

        let client;

        const existingClient = await clientService.findOne(clientObject);

        if (existingClient) {
            client = existingClient;
        } else {
            client = await clientService.createOne(clientObject);
        }

        if (!locationId) {
            return res.status(400).json({
                success: false,
                message: "locationId is required"
            });
        }

        const hasAccess = 
            req.user.accessAllLocations || req.user.locationIds.some(id => id.toString() === locationId);
        
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this location"
            });
        }

        const newAppointment = await appointmentService.create({
            businessId,
            locationId,
            clientId: client._id,
            serviceId,
            date,
            startTime,
            durationMins,
            resourceId,
            partySize: partySize || null,
            channel,
            createdBy
        });

        let googleCalendarSync = {
            synced: false,
        };

        try {
            googleCalendarSync = await googleCalendarService.createEventForAppointment(newAppointment);
        } catch(error) {
            console.log("Google Calendar sync failed: ", error.message);
        }

        /*
        * Do not delete or fail the booking just because Google
        * Calendar is temporarily unavailable.
        */

        return res.status(201).json({
            success: true,
            googleCalendarSync,
        });
        
    } catch(error) {
        next(error)
    }
};

// [PATCH] api/v1/business/appointments/edit/:appointmentId
module.exports.edit = async (req, res, next) => {
    try {   
        // const { businessId, locationId, appointmentId } = req.params;
        const businessId = req.user.businessId;
        const locationId = { $in: req.user.locationIds };
        const appointmentId = req.params.appointmentId;

        if(!req.body) {
            return res.status(400).json({
                success: false,
                message: "Missing request body"
            })
        };

        try {
            const result = await appointmentService.edit(businessId, locationId, appointmentId, req.body);

            if (result !== null) {
                const message = result.changed === false
                    ? "No changes detected"
                    : "Update successfully";

                return res.status(200).json({
                    success: true,
                    message,
                    data: result.appointment
                });
            };
            
            return res.status(404).json({
                success: false,
                message: "No matching appointment found"
            });

        } catch(error) {
            next(error);
        };


    } catch(error) {
        next(error);
    }
};

// [DELETE] api/v1/business/appointments/delete/:appointmentId
module.exports.delete = async (req, res, next) => {
    try {
        // const { businessId, locationId, appointmentId } = req.params;
        const businessId = req.user.businessId;
        const locationId = { $in: req.user.locationIds };
        const appointmentId = req.params.appointmentId;

        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Missing request body"
            })
        };

        const deleted = await appointmentService.delete(businessId, locationId, appointmentId, req.body);

        if (deleted === null) {
            return res.status(404).json({
                success: false,
                message: "No matching appointment found"
            })
        };

        return res.status(200).json({
            success: true,
            message: "Delete appointment successfully"
        });
            
    } catch(error) {
        next(error);
    }
};

// [PATCH] api/v1/business/appointments/change-status/:status/:appointmentId
module.exports.changeStatus = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const locationId = { $in: req.user.locationIds };
        const { status, appointmentId } = req.params;

        const updatedStatusAppointment = await appointmentService.changeStatus(
            businessId, 
            locationId, 
            appointmentId, 
            status, 
            req.body || null
        );

        if (updatedStatusAppointment !== null) {
            return res.status(200).json({
                success: true,
                message: "Update status successfully",
                data: updatedStatusAppointment
            });
        };

        return res.status(404).json({
            success: false,
            message: "No matching appointment found"
        });

    } catch(error) {
        next(error);
    }
};

// [GET] api/v1/business/appointments/status-history/:appointmentId
module.exports.statusHistory = async (req, res, next) => {
    try {
        // const { businessId, locationId, appointmentId } = req.params;
        const businessId = req.user.businessId;
        const locationId = { $in: req.user.locationIds };
        const appointmentId = req.params.appointmentId;

        const appointmentStatusHistory = await appointmentService.statusHistory(businessId, locationId, appointmentId);

        if (appointmentStatusHistory === null) {
              return res.status(404).json({
                success: false,
                message: "No matching appointment found"
            });
        };

        if (appointmentStatusHistory.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Found appointment status history",
                data: appointmentStatusHistory
            })
        };

        return res.status(200).json({
            success: true,
            message: "No status history yet"
        });

    } catch(error) {
        next(error);
    }
};





