const bcrypt = require("bcrypt");
const RefreshToken = require("../../../../models/RefreshToken.schema");
const User = require("../../../../models/User.model");
const {
    generateAccessToken,
    generateRefreshToken,
    hashToken
} = require("../../../../utils/generateTokens");

const ACCESS_TOKEN_EXPIRES_IN = "5m";
const ACCESS_TOKEN_COOKIE_MAX_AGE = 5 * 60 * 1000;
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;

const buildSignedUser = (user) => {
    return {
        userId: user._id,
        businessId: user.businessId,
        locationIds: user.locationIds,
        accessAllLocations: user.accessAllLocations,
        role: user.role
    };
};

const setAccessTokenCookie = (res, accessToken, maxAge = ACCESS_TOKEN_COOKIE_MAX_AGE) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: "lax",
        maxAge
    });
};

const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE
    });
};

module.exports.login = async (req, res) => {
    /**
     * 1) find user
     * 2) check password
     * 3) generate accessToken and refreshToken 
     */

    // Authenticate user 
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        })
    };

    const user = await User.findOne({
        email: email,
        status: { $ne: "deleted" }
    });

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        })
    };

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        })
    };
    // End authenticating user


    // Generate refresh token
    const refreshToken = generateRefreshToken();

    await RefreshToken.create({
        userId: user._id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS), // 7days
        createdByIp: req.ip,
        userAgent: req.headers["user-agent"]
    });
    // End generating refresh token


    // Generate access token
    const signedUser = buildSignedUser(user);
    const accessToken = generateAccessToken(signedUser, ACCESS_TOKEN_EXPIRES_IN);
    // End generating access token

    // Set Cookie
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
    // End setting cookie


    res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken: accessToken,
        refreshToken: refreshToken
    })
};

module.exports.refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Refresh token required"
        });
    }

    const storedToken = await RefreshToken.findOne({
        tokenHash: hashToken(refreshToken),
        revoked: false,
        expiresAt: { $gt: new Date() }
    });

    if (!storedToken) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    };

    const user = await User.findOne({
        _id: storedToken.userId,
        status: { $ne: "deleted" },
    });

    if (!user) {
        return res.status(403).json({
            success: false,
            message: "User is not available"
        })
    }

    const signedUser = buildSignedUser(user);
    const accessToken = generateAccessToken(signedUser, ACCESS_TOKEN_EXPIRES_IN);

    setAccessTokenCookie(res, accessToken, 1 * 60 * 1000);

    res.status(200).json({
        success: true,
        accessToken
    });
};

module.exports.logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            message: "Refresh token required"
        });
    }

    const result = await RefreshToken.updateOne({
        tokenHash: hashToken(refreshToken),
        revoked: false
    }, {
        revoked: true,
        revokedAt: new Date(),
        revokedByIp: req.ip
    });

    if (result.matchedCount === 0) {
        return res.status(400).json({
            success: false,
            message: "Refresh token not found or already revoked"
        })
    };

    // Delete cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    // End deleting cookies

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}

module.exports.me = async (req, res) => {
    const user = await User.findOne({
        _id: req.user.userId,
        businessId: req.user.businessId,
        status: { $ne: "deleted" },
    }).select("-passwordHash");

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }

    res.json({
        success: true,
        user
    });
}
