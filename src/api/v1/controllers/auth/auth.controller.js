const jwt = require("jsonwebtoken");

const User = require("../../../../models/User.model");

const generateTokens = require("../../../../utils/generateTokens");

module.exports.login = async (req, res) => {
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

    const signedUser = {
        userId: user._id,
        businessId: user.businessId,
        locationIds: user.locationIds,
        accessAllLocations: user.accessAllLocations,
        role: user.role
    };

    const accessToken = generateTokens.generateAccessToken(signedUser);

    res.json({
        accessToken: accessToken,
    })
};

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