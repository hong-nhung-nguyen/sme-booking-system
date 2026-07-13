const express = require("express");
const router = express.Router();

const controller = require("../../controllers/google/googleConnection.controller");

// starts OAuth. Redirects the business user to Google consent screen 
router.get("/auth", controller.auth);

// Google redirects here after consent. Backend exchanges `code` for tokens and stores them
router.get("/callback", controller.callback);

// Checks whether the current business has connected Google Calendar
// router.get("/status", controller.status);

// Revokes or removes stored Google tokens
router.delete("/disconnect", controller.disconnect);

module.exports = router;