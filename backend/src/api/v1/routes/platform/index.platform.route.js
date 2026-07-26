const express = require("express");
const router = express.Router();

const tenantRoutes = require("./business.route");

router.use("/tenants", tenantRoutes);

module.exports = router;
