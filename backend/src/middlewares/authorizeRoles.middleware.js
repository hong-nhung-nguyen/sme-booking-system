module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.accountType)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action"
            })
        }

        next();
    };
};