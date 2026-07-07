const OpenAi = require("openai");

const zodTextFormat = require("openai/helpers/zod");
const z = require("zod");

const parsedIntentZod = z.object({
    action: z.enum([
        "book", 
        "cancel", 
        "reschedule", 
        "check availability", 
        "general inquiry", 
        "undefined"
    ]).nullable(),
    service: z.string().nullable(),
    clientName: z.string().trim().min(1).nullable(),
    clientContact: z.string().nullable(),
    preferredDate: z
        .string()
        .nullable()
        .describe("Date in YYYY-MM-DD format, or null if missing"),
    preferredTime: z
        .string()
        .nullable()
        .describe("If preferredDate exists, return UTC ISO string. If preferredDate is null, return HH:mm local time. If missing, return null."),
    confidence: z.number().min(0).max(1)
});

module.exports = parsedIntentZod;