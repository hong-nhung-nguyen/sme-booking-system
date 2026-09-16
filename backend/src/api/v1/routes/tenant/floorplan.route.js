const express = require("express");
const router = express.Router({ mergeParams: true });

const floorPlanValidationSchema = require("../../validations/tenant/floorPlan.validation");
const validateMiddleware = require("../../../../middlewares/validateRequest.middleware");

const authorizeLocationAccess = require("../../../../middlewares/authorizeLocationAccess.middleware");
const authorizeRoles = require("../../../../middlewares/authorizeRoles.middleware");

const controller = require("../../controllers/tenant/floorplan.controller");

router.get(
    "/", 
    authorizeLocationAccess,
    controller.getSelectedLocationFloorPlan
);

router.post(
    "/create",
    authorizeLocationAccess, 
    authorizeRoles("owner", "manager"),
    validateMiddleware(floorPlanValidationSchema.createFloorPlan),
    controller.create
);

router.put(
    "/:floorPlanId",
    authorizeLocationAccess,
    authorizeRoles("owner", "manager"),
    validateMiddleware(floorPlanValidationSchema.updateFloorPlan),
    controller.update
);

router.get(
    "/:floorPlanId/live/:resourceId",
    authorizeLocationAccess,
    controller.tableStatusLive
);

module.exports = router;