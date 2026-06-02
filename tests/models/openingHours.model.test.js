const mongoose = require("mongoose");
const OpeningHours = require("../../src/models/OpeningHours.model");
const BusinessDay = require("../../src/models/BusinessDay.model");
const PublicHoliday = require("../../src/models/PublicHoliday.model");
const ExceptionDate = require("../../src/models/ExceptionDate.model");

const { connectTestDb, clearTestDb, closeTestDb } = require("../setUp/testDb");

beforeAll(async() => {
    await connectTestDb(),
    await OpeningHours.syncIndexes()
});

afterEach(async() => {
    await clearTestDb()
});

afterAll(async() => {
    await closeTestDb()
});

describe("OpeningHours model", () => {
    const validOpeningHoursData_BusinessDay = () => (
        {
            businessId: new mongoose.Types.ObjectId(),
            locationId: new mongoose.Types.ObjectId(),
            day: "monday",
            openTime: "08:00",
            closeTime: "21:00"
        }
    );

    const validOpeningHoursData_PublicHoliday = () => (
        {
            businessId: new mongoose.Types.ObjectId(),
            locationId: new mongoose.Types.ObjectId(),
            holidayName: "Christmas",
            startDate: "2026-12-24T00:00:00.000Z",
            endDate: "2026-12-26T00:00:00.000Z",
            isClosed: true
        }
    );

    const validOpeningHoursData_ExceptionDate = () => (
        {
            businessId: new mongoose.Types.ObjectId(),
            locationId: new mongoose.Types.ObjectId(),
            startDate: "2026-12-24T00:00:00.000Z",
            endDate: "2026-12-26T00:00:00.000Z",
            isClosed: false,
            openTime: "10:00",
            closeTime: "17:00"
        }
    );

    // test 1 --------------------------
    test("should pass validation with valid businessDay data", async() => {
        const openingHour = new BusinessDay(validOpeningHoursData_BusinessDay());
        await expect(openingHour.validate()).resolves.toBeUndefined();
    });

    // test 2 --------------------------
    test("should save BusinessDay with discriminator type", async() => {
        const doc = await BusinessDay.create(validOpeningHoursData_BusinessDay());
        expect(doc.type).toBe("businessDay");
        
        const found = await OpeningHours.findById(doc._id);
        expect(found.type).toBe("businessDay");
    });

    // test 3 --------------------------
    test("should pass validation with valid PublicHoliday data", async() => {
        const doc = new PublicHoliday(validOpeningHoursData_PublicHoliday());
        await expect(doc.validate()).resolves.toBeUndefined();
    });

    // test 4 --------------------------
    test("should save PublicHoliday with discrimininator key", async() => {
        const doc = await PublicHoliday.create(validOpeningHoursData_PublicHoliday());
        expect(doc.type).toBe("publicHoliday");
        const found = await OpeningHours.findById(doc._id);
        expect(found.type).toBe("publicHoliday");
    });

    // test 5 --------------------------
    test("should pass validation with valid ExceptionData data", async() => {
        const doc = new ExceptionDate(validOpeningHoursData_ExceptionDate());
        await expect(doc.validate()).resolves.toBeUndefined();
    });

    // test 6 --------------------------
    test("should save ExceptionDate with discrimininator key", async() => {
        const doc = await ExceptionDate.create(validOpeningHoursData_ExceptionDate());
        expect(doc.type).toBe("exceptionDate");
        const found = await OpeningHours.findById(doc._id);
        expect(found.type).toBe("exceptionDate");
    });

    // test 7 --------------------------
    test("should fail when closeTime before openTime", async() => {
        const doc = new BusinessDay({
            ...validOpeningHoursData_BusinessDay(),
            closeTime: "07:00"
        });
        await expect(doc.validate()).rejects.toThrow(
            "closeTime must be after openTime"
        );
    });

    // test 8 --------------------------
    test("should fail when isClosed is false and openTime and closeTime is missing", async() => {
        let data = validOpeningHoursData_ExceptionDate();
        delete data.openTime;
        delete data.closeTime;
        
        const doc = new ExceptionDate(data);
        await expect(doc.validate()).rejects.toThrow();
    });

    // test 9 --------------------------
    test("should fail when there is openTime and closeTime on an opened day", async() => {
        const doc = new PublicHoliday({
            ...validOpeningHoursData_PublicHoliday(),
            openTime: "8:00",
            closeTime: "10:00"
        });
        await expect(doc.validate()).rejects.toThrow();
    });
})

