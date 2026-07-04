const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../../middlewares/authenticateToken.middleware");
const controller = require("../../controllers/auth/auth.controller");

// Rate limit
const authRateLimit = require("../../../../middlewares/authRateLimit.middleware");

router.post("/login", authRateLimit ,controller.login);

router.post("/refresh", authRateLimit, controller.refreshAccessToken);

router.post("/logout", controller.logout);

router.get("/me", authMiddleware, controller.me);

module.exports = router;
