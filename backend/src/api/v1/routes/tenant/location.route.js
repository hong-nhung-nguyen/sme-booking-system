const express = require("express");
const router = express.Router({ mergeParams: true });

const authorizeRoles = require("../../../../middlewares/authorizeRoles.middleware");
const authorizeLocationAccess = require("../../../../middlewares/authorizeLocationAccess.middleware");

/*
const systemConfig = require("../../../../config/system");
const PATH_LOCATION = systemConfig.prefixLocation; // /locations/:locationId
*/

const controller = require("../../controllers/tenant/location.controller");

router.get("/", controller.index);

router.get("/:locationId", controller.findOneForBusiness);

router.post(
    "/create", 
    controller.create
);

/** ------------- LOCATION-SERVICE ASSIGNMENT -------------- */

// Assign multiple existing services 
router.post(
    "/:locationId/service", 
    authorizeLocationAccess,
    authorizeRoles("owner", "manager"),
    controller.createAndAssignService
);

router.put(
    "/:locationId/services", 
    authorizeLocationAccess,
    authorizeRoles("owner", "manager"),
    controller.assignServices
);

router.delete(
    "/:locationId/services/:serviceId",
    authorizeLocationAccess,
    authorizeRoles("owner", "manager"),
    controller.unassignService
);

router.patch(
    "/:locationId/services/:serviceId/status",
    authorizeLocationAccess,
    authorizeRoles("owner", "manager"),
    controller.updateServiceStatus
);

module.exports = router;
