const OpenAi = require("openai");

const zodTextFormat = require("openai/helpers/zod");
const z = require("zod");

const parsedIntentZod = z
    .object({
        action: z.enum([
            "book", 
            "cancel", 
            "reschedule", 
            "check_availability", 
            "general_inquiry", 
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
    })
    .strict() // reject extra fields that are not defined in the schema 
    .superRefine((data, ctx) => {
        
        // zod method for custom validation, especially when the rule depends
        // on multiple fields (normal field validation checks one field at a time)
        // automaticall runs with .safeParse(data) || .parse(data)

        const hasDate = !!data.preferredDate;
        const hasTime = !!data.preferredTime;

        if (!hasTime) return; 

        const hhmmRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
        const utcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

        if (hasDate && !utcRegex.test(data.preferredTime)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["preferredTime"],
                message: "If preferredDate is provided, preferredTime must be UTC format, e.g. 2026-07-15T04:30:00.000Z"
            });
        }

        if (!hasDate && !hhmmRegex.test(data.preferredTime)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["preferredTime"],
                message: "If preferredDate is missing, preferredTime must be 24-hour HH:mm format, e.g. 14.00"
            });
        }
    });

module.exports = parsedIntentZod;