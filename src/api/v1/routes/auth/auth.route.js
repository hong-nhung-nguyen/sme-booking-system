const express = require("express");
const router = express.Router();

const authMiddleware = require("../../../../middlewares/authenticateToken.middleware");
const controller = require("../../controllers/auth/auth.controller");

router.post("/login", controller.login);

router.get("/me", authMiddleware, controller.me);

module.exports = router;
