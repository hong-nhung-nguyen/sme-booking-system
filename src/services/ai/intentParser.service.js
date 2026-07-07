const OpenAI = require("openai");
require("dotenv").config();

const parseMessagePrompt = require("../../prompts/parseMessageIntent.prompt");
const intentSchemaZod = require("./intent.schema");
const { zodTextFormat } = require("openai/helpers/zod.js");
// const mockMessages = require("./mockMessages");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const defaultParsedIntent = {
    action: null,
    service: null,
    preferredDate: null,
    preferredTime: null,
    clientName: null,
    clientContact: null,
    confidence: 0
};

// Returns { action, service, preferredDate, preferredTime, clientName, clientContact, confidence 

const parseMessageIntent = async (message) => {
    if (!message || typeof message !== "string") {
        return defaultParsedIntent;
    }

    const input = parseMessagePrompt(new Date(), message);
    if (!input || typeof input !== "string") {
        return defaultParsedIntent;
    }

    try {
        const response = await client.responses.parse({
            model: "gpt-5.5",
            input: input,
            text: {
                format: zodTextFormat(intentSchemaZod, "intent_extraction"),
            }
        });

        const parsedIntent = response.output_parsed;

        if (!parsedIntent || parsedIntent === null) return defaultParsedIntent;
        
        return parsedIntent;

    } catch (error) {
        console.error("OpenAI intent parsing failed: ", error.message);
        return defaultParsedIntent;
    }
    
};

module.exports = parseMessageIntent;

