const { google } = require("googleapis");

const Business = require("../models/Business.model");
const Appointment = require("../models/Appointment.model");

const oauthConfig = require("../config/googleOAuth");

module.exports.createEventForAppointment = async (appointment) => {
    const business = await Business.findById(appointment.businessId);

    if (
        !business?.googleCalendar?.connected ||
        !business?.googleCalendar?.refreshToken
    ) {
        return {
            synced: false,
            reason: "Google Calendar is not connected"
        };
    }

    const oauth2Client = oauthConfig.createGoogleOAuthClient();

    /**
     * The Google library automatically obtains a new Google access token 
     * using the stored refresh token when necessary.
     */

    oauth2Client.setCredentials({
        refresh_token: business.googleCalendar.refreshToken,
        access_token: business.googleCalendar.accessToken || undefined,
        expiry_date: business.googleCalendar.expiryDate || undefined
    });

    const calendar = google.calendar({
        version: "v3",
        auth: oauth2Client
    });

    const requestBody = {
        summary: `Booking - ${[
            appointment.clientFirstName, 
            appointment.clientLastName
        ]
            .filter(Boolean)
            .join(" ")}`,

        description: [
            `Appointment ID: ${appointment._id}`,
            `Party size: ${appointment.partySize}`,
            `Status: ${appointment.status}`,
        ].join("\n"),

        start: {
            dateTime: appointment.startTime.toISOString(),
            timeZone: appointment.timezone || "Australia/Sydney",
        },

        end: {
            dateTime: appointment.endTime.toISOString(),
            timeZone: appointment.timezone || "Australia/Sydney"
        },

        extendedProperties: {
            private: {
                appointmentId: appointment._id.toString(),
                businessId: appointment.businessId.toString()
            },
        },
    };

    if (appointment.clientEmail) {
        requestBody.attendees = [
            {
                email: appointment.clientEmail,
                displayName: [
                    appointment.clientFirstName,
                    appointment.clientLastName,
                ]
                    .filter(Boolean)
                    .join(" "),
            },
        ];
    }

    try {
        const { data: event } = await calendar.events.insert({
            calendarId: business.googleCalendar.calendarId || "primary",
            requestBody,

            // Emails the client an invitation
            sendUpdates: appointment.clientEmail ? "all" : "none",
        });


        const syncedAppointment = await Appointment.findByIdAndUpdate(
            appointment._id, 
            {
                googleCalendarEventId: event.id,
                googleCalendarSyncStatus: "synced",
                googleCalendarSyncError: null
            }, 
            {
                new: true,
                runValidators: true,
            }
        );

        return {
            synced: true,
            eventId: event.id,
            appointment: syncedAppointment
        };

    } catch (error) {
        await Appointment.findByIdAndUpdate(appointment._id, {
            googleCalendarSyncStatus: "failed",
            googleCalendarSyncError: error.message || "Google Calendar sync failed",
        });

        throw error;
    }
};