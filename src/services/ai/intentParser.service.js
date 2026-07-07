const OpenAI = require("openai");
require("dotenv").config();

const mockMessages = require("./mockMessages");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Returns { action, service, preferredDate, preferredTime, clientName, clientContact, confidence }

const defaultParsedIntent = {
    action: null,
    service: null,
    preferredDate: null,
    preferredTime: null,
    clientName: null,
    clientContact: null,
    confidence: 0
};

const safeJsonParse = (text) => {
    try {
        return JSON.parse(text);
    } catch (error) {
        return null;
    }
}

const parseMessageIntent = async (message) => {
    const response = await client.responses.create({
        model: "gpt-5.5",
        input: `
You are helping a booking system understand customer messages. 

Extract the following information from the customer message: 

- action want to take
- service
- preferred time
- preferred date
- client name
- client contact
- confidence 

Rules: 
- Return ONLY valid JSON.
- Do not include markdown.
- Do not include explanation. 
- If a value is missing, use null. 
- confidence must be a number between 0 and 1. 
- action are grounded to only the following: 
"check availability", "book", "cancel", "reschedule", "general inquiry", "undefined".

Note: 
- The customer message may contain typos, slang, or informal language.
- If the customer gives a genertic time like "morning", "afternoon", or "evening", set the preferredTime to null.
- If the customer gives a generic date like "tomorrow", "next week", or "this Friday", use the current date
from when the message was sent to determine the actual date. If the date cannot be determined, set preferredDate to null. 
- If the customer gives a generic date like "friday" or "saturday" without specifying a week (e.g: "this friday" or "next saturday"), 
assume the current week and recalculate the confidence rate. 

Customer message: 
"${message}"

Return JSON in this exact format: 
{
    "action": null OR your_extraction,
    "service": null OR your_extraction,
    "preferredDate": null OR your_extraction,
    "preferredTime": null OR your_extraction,
    "clientName": null OR your_extraction,
    "clientContact": null OR your_extraction,
    "confidence": 
}
        `
    });

    const rawText = response.output_text;

    const parsed = safeJsonParse(rawText);

    if (!parsed) {
        return defaultParsedIntent;
    }

    // console.log("Parsed intent:", parsed);

    return {
        action: parsed.action || null,
        service: parsed.service || null,
        preferredDate: parsed.preferredDate || null,
        preferredTime: parsed.preferredTime || null,
        clientName: parsed.clientName || null,
        clientContact: parsed.clientContact || null,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
    };
};

module.exports = parseMessageIntent;

