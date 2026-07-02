const systemConfig = require("../../../config/system");

const platformRoutes = require("./platform/index.platform.route");
const tenantRoutes = require("./tenant/index.tenant.route");
const userRoutes = require("./user/user.route");

const authRoutes = require("./auth/auth.route");

module.exports = (app) => {
    const version = "/api/v1";
    const PATH_PLATFORM = systemConfig.prefixPlatform;
    const PATH_BUSINESS = systemConfig.prefixTenant;
    const PATH_AUTH = systemConfig.prefixAuth;
    const PATH_USER = systemConfig.prefixUser;

    app.use(version + PATH_AUTH, authRoutes);

    app.use(version + PATH_PLATFORM, platformRoutes);

    app.use(version + PATH_BUSINESS + "/:businessId", tenantRoutes);

    app.use(version + PATH_USER, userRoutes);

}