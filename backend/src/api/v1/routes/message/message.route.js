const express = require("express");
const router = express.Router();

const controller = require("../../controllers/message/message.controller");

router.post("/inbound", controller.inbound);

module.exports = router;