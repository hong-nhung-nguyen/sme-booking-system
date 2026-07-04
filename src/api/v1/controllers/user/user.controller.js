const bcrypt = require("bcrypt");
const User = require("../../../../models/User.model");

module.exports.register = async (req, res, next) => {
    const {
        businessId,
        locationIds,
        firstName,
        lastName,
        email,
        phone,
        role,
        password,
    } = req.body;

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "Email already exists"
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        businessId,
        locationIds,
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        role,
    });

    const userObject = user.toObject();
    delete userObject.passwordHash;

    res.status(201).json({
        success: true,
        message: "User created successfully",
        user: userObject
    })
}