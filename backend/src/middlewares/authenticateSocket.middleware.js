const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const AUTHENTICATION_ERROR = "Authentication failed";

module.exports = (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;

        if (!cookieHeader) {
            return next(new Error(AUTHENTICATION_ERROR));
        }

        const cookies = cookie.parse(cookieHeader);
        const accessToken = cookies.accessToken;

        if (!accessToken) {
            return next(new Error(AUTHENTICATION_ERROR));
        }

        const payload = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
        );

        if (
            !payload.userId ||
            !payload.businessId ||
            !payload.accountType
        ) {
            return next(new Error(AUTHENTICATION_ERROR));
        };

        socket.data.user = {
            userId: payload.userId,
            businessId: payload.businessId,
            role: payload.accountType,
            permittedLocations: payload.locationIds,
            accessAllLocations: payload.accessAllLocations
        };

        return next();
    } catch {
        return next(new Error(AUTHENTICATION_ERROR));
    }
};