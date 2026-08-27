const serviceService = require("../../../../services/tenant/service.service");

// [GET] api/v1/business/services
module.exports.index = async (req, res, next) => {
    const businessId = req.user.businessId;

    try {
        const services = await serviceService.findAllForBusiness({businessId});

        return res.status(200).json({
            success: true,
            services
        });
    } catch (error) {
        next(error);
    }
};

// [POST] api/v1/business/services/create
module.exports.create = async (req, res, next) => {
    const businessId = req.user.businessId;
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Missing request body"
            });
        }

        const newService = await serviceService.create({
            businessId,
            input: req.body,
        });

        return res.status(200).json({
            success: true,
            service: newService
        });

    } catch (error) {
        next(error);
    }
};

// [GET] api/v1/business/services/:serviceId
module.exports.detail = async (req, res, next) => {
    const businessId = req.user.businessId; 
    const serviceId = req.params.serviceId;

    try {
        const service = await serviceService.findOneForBusiness({ businessId, serviceId });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        return res.status(200).json({
            success: true,
            service
        });

    } catch (error) {
        next(error);
    }
}


