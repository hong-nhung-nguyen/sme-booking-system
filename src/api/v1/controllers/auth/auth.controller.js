const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const RefreshToken = require("../../../../models/RefreshToken.schema");
const User = require("../../../../models/User.model");

let refreshTokens = [];

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
};

// refresh token is just a random token - no signed
const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex");
};

const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports.login = async (req, res) => {
    /**
     * 1) find user
     * 2) check password
     * 3) generate accessToken and refreshToken 
     */

    // Authenticate user 
    const { email, password } = req.body;

    const user = await User.findOne({
        email: email,
        passwordHash: password,
        status: { $ne: "deleted" }
    });

    if (!user) {
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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7days
        createdByIp: req.ip,
        userAgent: req.headers["user-agent"]
    });
    // End generating refresh token


    // Generate access token
    const signedUser = {
        userId: user._id,
        businessId: user.businessId,
        locationIds: user.locationIds,
        accessAllLocations: user.accessAllLocations,
        role: user.role
    };

    const accessToken = generateAccessToken(signedUser);
    // End generating access token

    // Set Cookie
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: "lax",
        maxAge: 5 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
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
        status: "active",
    });

    if (!user) {
        return res.status(403).json({
            success: false,
            message: "User is not active"
        })
    }

    const signedUser = {
        userId: user._id,
        businessId: user.businessId,
        locationIds: user.locationIds,
        accessAllLocations: user.accessAllLocations,
        role: user.role
    };

    const accessToken = generateAccessToken(signedUser);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: "lax",
        maxAge: 1 * 60 * 1000
    });

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