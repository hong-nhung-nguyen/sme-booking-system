const jwt = require("jsonwebtoken");
const crypto = require("crypto");

module.exports.generateAccessToken = (user, expiresIn = "5m") => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn });
};

module.exports.generateRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex");
};

module.exports.hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};
