const mongoose = require("mongoose");
const IncomingMessage = require("../../src/models/IncomingMessage.model");
const ParsedIntent = require("../../src/models/ParsedIntent.schema");
const { connectTestDb, clearTestDb, closeTestDb } = require("../setUp/testDb");

beforeAll(async() => {
    await connectTestDb(),
    await IncomingMessage.syncIndexes()
});

afterEach(async() => {
    await clearTestDb();
});

afterAll(async() => {
    await closeTestDb();
});

describe("IncomingMessage model", () => {
    const validIntentData = () => ({
        intentType: "cancellation",
        requestTime: new Date("2026-08-19T00:00:00.000Z"),
        extractClientName: "Claire"
    });

    const validMessageData = () => ({
        businessId: new mongoose.Types.ObjectId(),
        channel: "sms",
        from: "0123456789",
        to: "0234567891",
        body: "cancel booking on 19/8/2026 for Claire",
        receivedAt: new Date("2026-05-01T00:00:00.000Z"),
        parsedIntent: validIntentData()
    });

    // test 1
    test("should pass validation with valid data", async() => {
        const message = new IncomingMessage(validMessageData());
        await expect(message.validate()).resolves.toBeUndefined();
    });

    // test 2
    test("should fail when missing businessId", async() => {
        const data = validMessageData();
        delete data.businessId;

        const message = new IncomingMessage(data);
        await expect(message.validate()).rejects.toThrow();
    });

    // test 3
    test("should fail when invalid channel value", async() => {
        const message = new IncomingMessage({
            ...validMessageData(),
            channel: "instagram"
        });
        await expect(message.validate()).rejects.toThrow();
    });

    // test 4
    test("should fail when missing from", async() => {
        const data = validMessageData();
        delete data.from;

        const message = new IncomingMessage(data);
        await expect(message.validate()).rejects.toThrow();
    });

    // test 5
    test("should fail when not aligning with phone format", async() => {
        const message = new IncomingMessage({
            ...validMessageData(),
            from: "123"
        });
        await expect(message.validate()).rejects.toThrow(
            "from must match the selected channel format"
        )
    });

    // test 6
    test("should fail when not aligning with email format", async() => {
        const message = new IncomingMessage({
            ...validMessageData(),
            channel: "email",
            to: "046837932093"
        });
        await expect(message.validate()).rejects.toThrow(
            "to must match the selected channel format"
        )
    })

    // test 7
    test("should fail when body is too long", async() => {
        const message = new IncomingMessage({
            ...validMessageData(),
            body: "a".repeat(5001)
        });
        await expect(message.validate()).rejects.toThrow();
    });

    // test 8
    test("should fail when missing ParsedIntent", async() => {
        const data = validMessageData();
        delete data.parsedIntent;

        const message = new IncomingMessage(data);
        await expect(message.validate()).rejects.toThrow();
    });

    // test 9
    test("processingStatus_default should be pending", async() => {
        const message = new IncomingMessage(validMessageData());
        await expect(message.processingStatus).toBe("pending");
    });
})