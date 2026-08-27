const express = require("express");
const authorizeLocationAccess = require("../../../../middlewares/authorizeLocationAccess.middleware.js");

// Joi validation
const serviceValidationSchema = require("../../validations/tenant/service.validation.js");
const validateMiddleware = require("../../../../middlewares/validateRequest.middleware.js");
// End Joi validation 

const controller = require("../../controllers/tenant/service.controller.js");

const router = express.Router({ mergeParams: true });

// router.use(authorizeLocationAccess);

// Business-wide services catalogue (no location authorization)
router.get(
    "/", 
    validateMiddleware(serviceValidationSchema.findAllServicesSchema),
    controller.index
);

router.post(
    "/create", 
    validateMiddleware(serviceValidationSchema.createServiceSchema),
    controller.create
);

router.get(
    "/detail/:serviceId", 
    validateMiddleware(serviceValidationSchema.findOneServiceSchema),
    controller.detail
);

router.patch(
    "/edit/:serviceId", 
    validateMiddleware(serviceValidationSchema.updateServiceSchema),
    controller.editOne
);

router.delete(
    "/delete/:serviceId", 
    validateMiddleware(serviceValidationSchema.deleteServiceSchema),
    controller.deleteOne
);

router.patch(
    "/:serviceId/change-status/:status",
    validateMiddleware(serviceValidationSchema.updateStatusServiceSchema), 
    controller.updateStatus
);

module.exports = router;