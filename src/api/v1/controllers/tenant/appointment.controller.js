const appointmentService = require("../../../../services/tenant/appointment.service");
const appointmentRepository = require("../../../../repository/appointment.repository");

// [GET] api/v1/business/appointments
module.exports.index = async (req, res, next) => {
    try {
        let find = {
            businessId: req.user.businessId,
            locationId: { $in: req.user.locationIds },
            deleted: false,
        };

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

// [GET] api/v1/business/appointments/detail/:appointmentId
module.exports.detail = async (req, res, next) => {
    try {
        // const { businessId, locationId, appointmentId } = req.params;
        const businessId = req.user.businessId;
        const locationId = { $in: req.user.locationIds };
        const appointmentId = req.params.appointmentId;

        const record = await appointmentRepository.findOne(businessId, locationId, appointmentId);

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
            clientId,
            serviceId,
            date,
            startTime,
            partySize,
            channel,
            createdBy
        } = req.body;

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
            clientId,
            serviceId,
            date,
            startTime,
            partySize,
            channel,
            createdBy
        });

        return res.status(201).json({
            success: true,
            data: newAppointment
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
            const editedAppointment = await appointmentService.edit(businessId, locationId, appointmentId, req.body);

            if (editedAppointment !== null) {
                return res.status(200).json({
                    success: true,
                    message: "Update successfully",
                    data: editedAppointment
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
}




