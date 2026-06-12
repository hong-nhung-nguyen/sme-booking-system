const appointmentService = require("../../../../services/tenant/appointment.service");

// [GET] api/v1/tenants/:tenantId/locations/:locationId/appointments
module.exports.index = async (req, res) => {
    try {
        const { tenantId, locationId } = req.params;

        // Validate required parameters
        if (!tenantId) {
            return res.status(400).json({
                message: "tenantId missing"
            })
        };

        if (!locationId) {
            return res.status(400).json({
                message: "locationId missing"
            })
        };
        // End validate parameters

        // Filter GET with query
        let find = {
            businessId: tenantId,
            locationId: locationId
        }

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
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}
