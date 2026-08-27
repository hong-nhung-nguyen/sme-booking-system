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
