const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // Authorization: Bearer <access_token>

    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(" ")[1];

    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token required"
        });
    }

    // checks if the JWT is real, unchanged, and not expired
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: "Access token expired or invalid"
            });
        }
        
        req.user = user;
        next();
    })
}