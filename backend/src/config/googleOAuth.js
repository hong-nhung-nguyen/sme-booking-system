const { google } = require("googleapis");

const requiredGoogleOAuthKeys = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
    "GOOGLE_OAUTH_STATE_SECRET"
];

const getGoogleOAuthConfig = () => {
    const missingKeys = requiredGoogleOAuthKeys.filter((key) => !process.env[key]);

    if (missingKeys.length > 0) {
        throw new Error(`Missing Google OAuth env vars: ${missingKeys.join(", ")}`);
    };

    return {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        stateSecret: process.env.GOOGLE_OAUTH_STATE_SECRET
    };
};

const createGoogleOAuthClient = () => {
    const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

module.exports = {
    getGoogleOAuthConfig,
    createGoogleOAuthClient
};
