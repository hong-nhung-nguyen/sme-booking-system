const OpenAI = require("openai");
require("dotenv").config();

const parseMessagePrompt = require("../../prompts/parseMessageIntent.prompt");
const intentSchemaZod = require("./intent.schema");
const { zodTextFormat } = require("openai/helpers/zod.js");
// const mockMessages = require("./mockMessages");

let client = null;

/**
 * The client is built on first use rather than at import time, so the whole
 * server can still boot without an OPENAI_API_KEY — only message parsing
 * needs one. Returns null when no key is configured.
 */
const getClient = () => {
    if (client) return client;

    if (!process.env.OPENAI_API_KEY) return null;

    client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    return client;
};

const defaultParsedIntent = {
    action: null,
    service: null,
    preferredDate: null,
    preferredTime: null,
    clientName: null,
    clientContact: null,
    confidence: 0
};

const validateParsedIntent = (data) => {
    // safeParse(): zod method that validates data without crashing the app 
    /**
     * {
     *      success: true,
     *      data: validatedData 
     * }
     */

    /**
     * Make validation explicit. Throw error instead of returning the
     * default intent when Zod validation fails 
     */
    const result = intentSchemaZod.safeParse(data);

    if (!result.success) {
        const error = new Error("OpenAI returned an invalid intent");
        error.cause = result.error;
        throw error;
    }
    
    return result.data;
}

// Returns { action, service, preferredDate, preferredTime, clientName, clientContact, confidence 

const parseMessageIntent = async (message) => {
    if (!message || typeof message !== "string") {
        return defaultParsedIntent;
    };

    const businessTimezone = "Australia/Sydney";

    const currentDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: businessTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());

    const prompt = parseMessagePrompt(currentDate, businessTimezone, message);
    if (!prompt || typeof prompt !== "string") {
        return defaultParsedIntent;
    }

    const openai = getClient();

    if (!openai) {
        throw new Error("OPEN_API_KEY is not configured");
    }

    try {
        const response = await openai.responses.parse({
            model: "gpt-5.5",
            input: prompt,
            text: {
                format: zodTextFormat(intentSchemaZod, "intent_extraction"),
            }
        });

        /**
         * Throw errors for every OpenAI failures instead of 
         * returning default schema with confidence = 0 
         */

        if (!response.output_parsed) {
            throw new Error("OpenAI returned no parsed intent");
        }
        
        return validateParsedIntent(response.output_parsed);

    } catch (error) {
        console.error("OpenAI intent parsing failed: ", error.message);
        throw error;
    }
    
};

module.exports = parseMessageIntent;

