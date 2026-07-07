const OpenAI = require("openai");
require("dotenv").config();

const parseMessagePrompt = require("../../prompts/parseMessageIntent.prompt");
const intentSchemaZod = require("./intent.schema");
const { zodTextFormat } = require("openai/helpers/zod.js");
// const mockMessages = require("./mockMessages");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Returns { action, service, preferredDate, preferredTime, clientName, clientContact, confidence 

const parseMessageIntent = async (message) => {
    const response = await client.responses.parse({
        model: "gpt-5.5",
        input: parseMessagePrompt(new Date(), message),
        text: {
            format: zodTextFormat(intentSchemaZod, "intent_extraction"),
        }
    });

    const parsedIntent = response.output_parsed;
    return parsedIntent;
};

module.exports = parseMessageIntent;

