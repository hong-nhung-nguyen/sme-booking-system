const serviceService = require("../../../../services/tenant/service.service");

// [GET] api/v1/business/services
module.exports.index = async (req, res, next) => {
    const businessId = req.user.businessId;

    try {
        let find = {
            businessId,
            deleted: false
        };

        if (req.query.status) {
            find.status = req.query.status;
        }

        let nameSearch = {
            keyword: ""
        }

        if (req.query.name) {
            nameSearch.keyword = req.query.name;

            // remove the special characters in the search query
            const cleanedName = req.query.name.replace(/[^a-zA-Z0-9\s]/g, "");
            const regex = new RegExp(cleanedName.keyword, "i");
            nameSearch.regex = regex;

            find.name = nameSearch.regex;
        }

        const services = await serviceService.findAllForBusiness(find);

        return res.status(200).json({
            success: true,
            services
        });
    } catch (error) {
        next(error);
    }
};

const nameAlreadyExistsError = (res, error) => {
    if (error?.code === 11000 && error?.keyPattern?.name) {
        return res.status(409).json({
            success: false,
            message: "A service with this name already exists"
        })
    }

    return next(error);
}

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
        nameAlreadyExistsError(res, error);
    }
};

// [GET] api/v1/business/services/detail/:serviceId
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
        nameAlreadyExistsError(res, error);
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
};




