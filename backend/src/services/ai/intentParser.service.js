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
    const result = intentSchemaZod.safeParse(data);

    if (!result.success) {
        console.log("Invalid JSON output: ", result.error.flatten());
        return defaultParsedIntent;
    }
    
    return result.data;
}

// Returns { action, service, preferredDate, preferredTime, clientName, clientContact, confidence 

const parseMessageIntent = async (message) => {
    if (!message || typeof message !== "string") {
        return defaultParsedIntent;
    }

    const prompt = parseMessagePrompt(new Date(), message);
    if (!prompt || typeof prompt !== "string") {
        return defaultParsedIntent;
    }

    const openai = getClient();

    if (!openai) {
        console.warn(
            "OPENAI_API_KEY is not set — skipping intent parsing."
        );
        return defaultParsedIntent;
    }

    try {
        const response = await openai.responses.parse({
            model: "gpt-5.5",
            input: prompt,
            text: {
                format: zodTextFormat(intentSchemaZod, "intent_extraction"),
            }
        });

        const parsedIntent = response.output_parsed;

        if (!parsedIntent || parsedIntent === null) return defaultParsedIntent;
        
        return validateParsedIntent(parsedIntent);

    } catch (error) {
        console.error("OpenAI intent parsing failed: ", error.message);
        return defaultParsedIntent;
    }
    
};

module.exports = parseMessageIntent;

