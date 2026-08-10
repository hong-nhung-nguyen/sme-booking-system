module.exports = (currentDate, businessTimezone, message) => {
return `
You are helping a booking system extract structured data from customer messages.

Extract the customer's booking intent from the message.

Return ONLY valid JSON. Do not include explanations, markdown, or extra text.

Current context:
- Current local date: ${currentDate} 
- Business timezone: ${businessTimezone}

Rules:
1. action:
   - Use one of: "book", "cancel", "reschedule", "check_availability", "general_inquiry", "undefined".
   - Use "undefined" only when the customer's intent cannot be identified.
   - If the customer wants to make a booking, use "book".
   - If the customer wants to change an existing booking, use "reschedule".
   - If the customer wants to cancel, use "cancel".
   - If the message is only asking a question, use "general_inquiry".
   - If the customer wants to ask about available slots, use "check_availability".
   - If unclear, use "undefined".

2. service:
   - Extract the requested service if mentioned.
   - If not mentioned, use null.

3. preferredDate:
   - preferredDate must be YYYY-MM-DD in the business's local calendar.
   - The format must match this regex: /^\\d{4}-\\d{2}-\\d{2}$/.
   - Examples:
     - "tomorrow" should be converted using the current date.
     - "next Monday" should be converted using the current date.
     - "July 20" should be converted to the correct YYYY-MM-DD year.
   - If no date is mentioned, use null.

4. preferredTime:
   - Extract the preferred time if mentioned.
   - Do not convert preferredTime to UTC.
   - Example:
     - customer says: "2pm"
     - business timezone: "Australia/Melbourne"
     - preferredTime should be like: "14:00"
   - If no time is mentioned, use null.

5. clientName:
   - Extract the customer name if mentioned.
   - If not mentioned, use null.

6. clientContact:
   - Extract phone number or email if mentioned.
   - If the client intents the contact to be email but not in a valid email format (including "@"), use null.
   - If not mentioned, use null.

7. confidence:
   - Return a number between 0 and 1.
   - Higher confidence means the message clearly gives booking intent.
   - Lower confidence means the message is vague or missing important details.

Note: 
- The customer message may contain typos, slang, or informal language. Based on this to recalculate
the confidence rate
- For "book" action, all fields should be provided, or else, lower the confidence rate.
- For "cancel" and "reschedule" actions, clientName, clientContact, preferredDate, and preferredTime
should be provided, especially clientContact and preferredDate or else, lower the confidate rate. 
- Always keep the confidence rate low for action: "undefined"

Return JSON in exactly this structure:

{
  "action": null,
  "service": null,
  "preferredDate": null,
  "preferredTime": null,
  "clientName": null,
  "clientContact": null,
  "confidence": 0
}

Customer message:
${message}
`
} 