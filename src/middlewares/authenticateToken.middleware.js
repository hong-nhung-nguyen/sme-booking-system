const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // Authorization: Bearer <access_token>

    // const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(" ")[1];

    const token = req.cookies.accessToken;

    if (token == null) return res.sendStatus(401);

    // checks if the JWT is real, unchanged, and not expired
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    })
}