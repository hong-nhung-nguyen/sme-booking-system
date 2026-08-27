const express = require("express");
const router = express.Router({ mergeParams: true });

const controller = require("../../controllers/tenant/location.controller");

router.get("/", controller.index);

router.post("/create", controller.create);

module.exports = router;
