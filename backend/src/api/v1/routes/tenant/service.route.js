const express = require("express");
const authorizeLocationAccess = require("../../../../middlewares/authorizeLocationAccess.middleware.js");
const controller = require("../../controllers/tenant/service.controller.js");

const router = express.Router({ mergeParams: true });

// router.use(authorizeLocationAccess);

// Business-wide services catalogue (no location authorization)
router.get("/", controller.index);

router.post("/create", controller.create);

module.exports = router;