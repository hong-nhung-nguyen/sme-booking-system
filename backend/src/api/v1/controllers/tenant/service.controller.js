const { response } = require("express");
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
};

// [PATCH] api/v1/business/services/edit/:serviceId
module.exports.editOne = async (req, res, next) => {
    const businessId = req.user.businessId;
    const actorId = req.user.userId;
    const serviceId = req.params.serviceId;

    try {
        const originalService = await serviceService.findOneForBusiness({ businessId, serviceId });
        
        if (!req.body) {
            return res.status(200).json({
                success: true,
                service: originalService
            });
        }

        const input = req.body;

        const updatedService = await serviceService.editOne({ businessId, serviceId, input, actorId });

        if (!updatedService) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        return res.status(200).json({
            success: true,
            service: updatedService
        });

    } catch (error) {
        next(error);
    }
};

// [DELETE] api/v1/business/services/delete/:serviceId
module.exports.deleteOne = async (req, res, next) => {
    const businessId = req.user.businessId;
    const actorId = req.user.userId;
    const serviceId = req.params.serviceId;

    try {
        const deleted = await serviceService.deleteOne({ businessId, serviceId, actorId });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Delete service successfully"
        });

    } catch (error) {
        next(error);
    }
};

// [PATCH] api/v1/business/services/:serviceId/change-status/:status
module.exports.updateStatus = async (req, res, next) => {
    const businessId = req.user.businessId;
    const actorId = req.user.userId;
    const { serviceId, status } = req.params;

    try {
        const input = { status };

        const updatedService = await serviceService.editOne({ businessId, serviceId, input, actorId });

        if (!updatedService) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        return res.status(200).json({
            success: true,
            service: updatedService
        })

    } catch (error) {
        next(error);
    }
}




