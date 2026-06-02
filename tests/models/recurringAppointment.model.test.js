const mongoose = require("mongoose");
const RecurringAppointment = require("../../src/models/RecurringAppointment.model");
const { connectTestDb, clearTestDb, closeTestDb } = require("../setUp/testDb");

beforeAll(async() => {
    await connectTestDb(),
    await RecurringAppointment.syncIndexes()
});

afterEach(async() => {
    await clearTestDb();
});

afterAll(async() => {
    await closeTestDb();
});

describe("RecurringAppointment model", () => {
    const validRecurringData = () => (
        {
            businessId: new mongoose.Types.ObjectId(),
            locationId: new mongoose.Types.ObjectId(),
            clientId: new mongoose.Types.ObjectId(),
            serviceId: new mongoose.Types.ObjectId(),
            frequency: "daily",
            startDate: new Date("2026-06-01T00:00:00.000Z"),
            startTime: "10:00",
            durationMinutes: 90
        }
    );

    // test 1 ------------------------
    test("should pass validation with valid data", async() => {
        const recurring = new RecurringAppointment(validRecurringData());
        await expect(recurring.validate()).resolves.toBeUndefined();
    });

    // test 2
    test("should fail if serviceId is missing", async() => {
        let data = validRecurringData();
        delete data.serviceId;

        const recurring = new RecurringAppointment(data);
        await expect(recurring.validate()).rejects.toThrow();
    });

    // test 3
    test("shoud fail if timezone_default is not Australia/Sydney", async() => {
        const recurring = new RecurringAppointment(validRecurringData());
        await expect(recurring.timezone).toBe("Australia/Sydney");
    });

    // test 4
    test("should fail if invalid frequency value", async() => {
        const recurring = new RecurringAppointment({
            ...validRecurringData(),
            frequency: "yearly"
        });
        await expect(recurring.validate()).rejects.toThrow();
    });

    // test 5
    test("should fail if interval < 1", async() => {
        const recurring = new RecurringAppointment({
            ...validRecurringData(),
            interval: 0
        });
        await expect(recurring.validate()).rejects.toThrow();
    });

    // test 6
    test("should fail when missing daysOfWeek if frequency=weekly/fortnightly", async() => {
        const recurring = new RecurringAppointment({
            ...validRecurringData(),
            frequency: "weekly"
        });
        await expect(recurring.validate()).rejects.toThrow(
            "daysOfWeek is required for weekly and fortnightly occurrence and cannot contain duplicates"
        );
    });

    // test 7
    test("should fail if missing dates when frequency=monthly", async() => {
        const recurring = new RecurringAppointment({
            ...validRecurringData(),
            frequency: "monthly"
        });
        await expect(recurring.validate()).rejects.toThrow(
            "dates must include at least one date"
        )
    });

    // test 8
    test("should fail when missing both durationMinutes and endTime", async() => {
        const data = validRecurringData();
        delete data.durationMinutes;

        const recurring = new RecurringAppointment(data);
        await expect(recurring.validate()).rejects.toThrow();
    });

    // test 9
    test("should fail when endDate is before startDate", async() => {
        const recurring = new RecurringAppointment({
            ...validRecurringData(),
            endDate: new Date("2026-05-01T00:00:00.000Z")
        });
        await expect(recurring.validate()).rejects.toThrow(
            "endDate must be after or equal to startDate"
        )
    });

    // test 10
    test("should fail when endTime is before or equal to startTime", async() => {
        const recurring = new RecurringAppointment({
            ...validRecurringData(),
            endTime: "10:00"
        });
        await expect(recurring.validate()).rejects.toThrow(
            "endTime must be after startTime"
        )
    });

    // test 11
    test("should fail when daysOfWeek contain duplicates", async() => {
        const recurring = new RecurringAppointment({
            ...validRecurringData(),
            frequency: "weekly",
            daysOfWeek: ["sunday", "monday", "sunday"]
        });
        await expect(recurring.validate()).rejects.toThrow(
            "daysOfWeek is required for weekly and fortnightly occurrence and cannot contain duplicates"
        )
    });

    // test 12
    test("should fail when dates contain duplicates", async() => {
        const recurring = new RecurringAppointment({
            ...validRecurringData(),
            frequency: "monthly",
            dates: [
                new Date("2026-05-01T00:00:00.000Z"),
                new Date("2026-06-01T00:00:00.000Z"),
                new Date("2026-05-01T00:00:00.000Z")
            ]
        });
        await expect(recurring.validate()).rejects.toThrow(
            "dates must not contain duplicates"
        )
    });
})