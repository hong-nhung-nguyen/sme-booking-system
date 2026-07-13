const { google } = require("googleapis");
const jwt = require("jsonwebtoken");

const oauthConfig = require("../../../../config/googleOAuth");
const Business = require("../../../../models/Business.model");

const GOOGLE_CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

const createOAuthClient = () => {
    return oauthConfig.createGoogleOAuthClient();
}

// [GET] api/v1/google-calendar/auth
module.exports.auth = async (req, res, next) => {
    try {
        const state = jwt.sign(
            { businessId: req.user.businessId },
            process.env.GOOGLE_OAUTH_STATE_SECRET,
            { expiresIn: "10m" }
        );
        
        const url = oauth2Client.generateAuthUrl({
            access_type:"offline",
            /**
             * requests a refresh token so backend can access the calendar
             * when the business owner is not currently using the application.
             * 
             * Refresh tokens should be stored securely 
             */
            scope:"https://www.googleapis.com/auth/calendar.events",
            // events: can create, update, and cancel appointment events
            // readonly: only permits reading 
            state
        });
        res.redirect(url);
    } catch (error) {
        next(error);
    }
    
};

// [GET] /api/v1/google-calender/callback 
module.exports.callback = async (req, res, next) => {
    try {
        const { code, state, error } = req.query;
        /**
         * code = temporary code exchanged for tokens
         * state = security/tracking value returned unchanged
         * error = explanation that authorization did not succeed 
         */

        // The user denied access on Google's consent screen
        if (error) {
            return res.status(401).json({
                success: false,
                message: "Google Calendar authorization was denied"
            });
        }

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Authorization code is missing"
            });
        }

        /*
         * Validate state before trusting it.
         * It should securely identify the business that started OAuth.
         */
        const decoded = jwt.verify(state, process.env.GOOGLE_OAUTH_STATE_SECRET);
        const businessId = decoded.businessId;

        if (!businessId) {
            return res.status(400).json({
                success: false,
                message: "OAuth state is missing"
            });
        }

        const { tokens } = await oauth2Client.getToken(code);

        const business = await Business.findById(businessId);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
            });
        }

        business.googleCalendar = {
            ...business.googleCalendar,

            // Keep the existing refresh token when Google does not return a new one
            refreshToken:
                tokens.refresh_token ||
                business.googleCalendar?.refreshToken,

            accessToken: tokens.access_token,
            tokenType: tokens.token_type,
            scope: tokens.scope,
            expiryDate: tokens.expiry_date,
            connected: true
        };

        await business.save();

        return res.status(200).json({
            success: true,
            message: "Google Calendar connected successfully"
        });
    } catch (error) {
        next(error);
    }
};

// module.exports.status = async (req, res, next) => {};

// [DELETE] /api/v1/google-calendar/disconnect
module.exports.disconnect = async (req, res, next) => {
    /**
     * 1. Revokes the Google OAuth token
     * 2. Removes the stored Google tokens and connection details from the Business document 
     */

    try {
        const business = await Business.findById(req.user.businessId);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
            });
        };

        const refreshToken = business.googleCalendar?.refreshToken;

        if (refreshToken) {
            await oauth2Client.revokeToken(refreshToken);
        }

        business.googleCalendar = {
            connected: false,
            accessToken: null,
            refreshToken: null,
            expiryDate: null,
            calendarId: null
        };

        await business.save();

        return res.status(200).json({
            success: true,
            message: "Google Calendar disconnected successfully"
        });

    } catch(error) {
        next(error);
    }
};

// [GET] api/v1/google-calendar/events
module.exports.events = async (req, res, next) => {
    try {
        const businessId = req.user?.businessId;

        if (!businessId) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user does not have a businessId"
            });
        };

        const business = await Business.findById(businessId);

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
            });
        };

        if (
            !business.googleCalendar?.connected ||
            !business.googleCalendar?.refreshToken
        ) {
            return res.status(400).json({
                success: false,
                message: "Google Calendar is not connected"
            });
        };

        const oauth2Client = createOAuthClient();

        oauth2Client.setCredentials({
            refresh_token: business.googleCalendar.refreshToken,
            access_token: business.googleCalendar.accessToken || undefined,
            expiry_date: business.googleCalendar.expiryDate || undefined
        });

        const calendar = google.calendar({
            version: "v3",
            auth: oauth2Client
        });

        const calendarId = business.googleCalendar.calendarId || "primary";

        const { data } = await calendar.events.list({
            calendarId,
            timeMin: new Date().toISOString(),
            maxResults: 15,
            singleEvents: true,
            orderBy: "startTime"
        });

        return res.status(200).json({
            success: true,
            count: data.items?.length || 0,
            events: data.items || [],
            nextPageToken: data.nextPageToken || null
        });

    } catch(error) {
        next(error);
    }
}