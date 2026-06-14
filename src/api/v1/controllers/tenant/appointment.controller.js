const appointmentService = require("../../../../services/tenant/appointment.service");

// [GET] api/v1/business/:businessId/locations/:locationId/appointments
module.exports.index = async (req, res, next) => {
    try {
        const { businessId, locationId } = req.params;

        const requiredParams = ["businessId", "locationId"];

        let find = {};

        // Validate required parameters
        for (const param of requiredParams) {
            if (!req.params[param]) {
                return res.status(400).json({
                    message: `${param} is missing`
                })
            };
            find[param] = req.params[param];
        }
        // End validate parameters

        // Filter GET with query

        const allowedFilters = ["serviceId", "clientId", "status", "date"];

        allowedFilters.forEach((filter) => {
            if(req.query[filter]) {
                find[filter] = req.query[filter];
            }
        })
        // End filter GET with query

        // Find all appointments 
        const appointments = await appointmentService.find(find);

        if (appointments.length > 0) {
            return res.status(200).json({
                message: "Appointments found",
                appointments: appointments
            })
        };

        return res.status(404).json({
            message: "No booking found"
        });

    } catch(error) {
        next(error);
    }
};

// [GET] api/v1/businesses/:businessId/locations/:locationId/appointments/detail/:appointmentId
module.exports.detail = async (req, res, next) => {
    try {
        const { businessId, locationId, appointmentId } = req.params;

        const requiredParams = ["businessId", "locationId", "appointmentId"];


        for (const param of requiredParams) {
            if (!req.params[param]) {
                return res.status(400).json({
                    message: `${param} is missing`
                })
            }
        };

        let find = {
            _id: appointmentId,
            businessId: businessId,
            locationId: locationId
        }

        const record = await appointmentService.find(find);

        if (record[0]) {
            return res.status(200).json({
                message: "appointment found",
                data: record[0]
            })
        };

        return res.status(404).json({
            message: "No appointment found"
        });

    } catch(error) {
        next(error);
    }
};

// [POST] api/v1/businesses/:businessId/locations/:locationId/appointments/create
module.exports.create = async (req, res, next) => {
    try {
        const { businessId, locationId } = req.params;

        if (!req.body) {
            return res.status(400).json({
                message: "Missing request body"
            });
        }

        const requiredParams = ["businessId", "locationId"];

        for (const param of requiredParams) {
            if (!req.params[param]) {
                return res.status(400).json({
                    message: `${param} is missing`
                })
            }
            req.body[param] = req.params[param];
        }

        try {
            const newAppointment = await appointmentService.create(req.body);

            return res.status(200).json({
                success: true,
                data: newAppointment
            })

        } catch(error) {
            return res.status(400).json({
                success: false,
                message: error.message
            })
        }
    } catch(error) {
        next(error)
    }
};

// [PATCH] api/v1/businesses/:businessId/locations/:locationId/appointments/edit/:appointmentId
module.exports.edit = async (req, res, next) => {
    try {   
        const { businessId, locationId, appointmentId } = req.params;

        const requiredParams = ["businessId", "locationId", "appointmentId"];

        for (const param of requiredParams) {
            if (!req.params[param]) {
                res.status(400).json({
                    success: false,
                    message: `{param} is missing`
                })
            }
        };

        if(!req.body) {
            return res.status(400).json({
                success: false,
                message: "Missing request body"
            })
        };

        try {
            const editedAppointment = await appointmentService.edit(appointmentId, req.body);

            return res.status(200).json({
                success: true,
                message: "Update successfully",
                data: editedAppointment
            });

        } catch(error) {
            next(error);
        };


    } catch(error) {
        next(error);
    }
}


