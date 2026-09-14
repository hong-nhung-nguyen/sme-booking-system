const express = require("express");
const router = express.Router({ mergeParams: true });

const authorizeLocationAccess = require("../../../../middlewares/authorizeLocationAccess.middleware");

const controller = require("../../controllers/tenant/floorplan.controller");

router.get(
    "/", 
    authorizeLocationAccess,
    controller.getSelectedLocationFloorPlan
);

router.post(
    "/create",
    authorizeLocationAccess, 
    controller.create
);

module.exports = router;