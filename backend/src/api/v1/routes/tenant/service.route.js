const express = require("express");
const authorizeLocationAccess = require("../../../../middlewares/authorizeLocationAccess.middleware.js");
const controller = require("../../controllers/tenant/service.controller.js");

const router = express.Router({ mergeParams: true });

// router.use(authorizeLocationAccess);

// Business-wide services catalogue (no location authorization)
router.get("/", controller.index);

router.post("/create", controller.create);

router.get("/:serviceId", controller.detail);

router.patch("/edit/:serviceId", controller.editOne);

router.delete("/delete/:serviceId", controller.deleteOne);

module.exports = router;