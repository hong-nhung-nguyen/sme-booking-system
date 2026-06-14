const mongoose = require("mongoose");
const Service = require("../../src/models/Service.model")
const { connectTestDb, clearTestDb, closeTestDb } = require("../setUp/testDb");

beforeAll(async() => {
    await connectTestDb();
    await Service.syncIndexes();
});

afterEach(async() => {
    await clearTestDb();
});

afterAll(async() => {
    await closeTestDb();
});

describe("Service model", () => {
    const validServiceData = () => (
        {
            businessId: new mongoose.Types.ObjectId(),
            name: "Breakfast",
            defaultDurationMinutes: 90,
        }
    );

    // test 1 --------------------------
    test("should pass validation with valid data", async() => {
        const service = new Service(validServiceData());
        await expect(service.validate()).resolves.toBeUndefined();
    });

    // test 2 --------------------------
    test("should fail when businessId missing", async() => {
        const data = validServiceData();
        delete data.businessId;

        const service = new Service(data);
        await expect(service.validate()).rejects.toThrow();
    });

    // test 3 --------------------------
    test("shoul fail when name longer than 100 characters", async() => {
        const service = new Service({
            ...validServiceData(),
            name: "a".repeat(101)
        });
        await expect(service.validate()).rejects.toThrow();
    });

    // test 4 --------------------------
    test("should fail when defaultDurationMinutes less than 5", async() => {
        const service = new Service({
            ...validServiceData(),
            defaultDurationMinutes: 4
        });
        await expect(service.validate()).rejects.toThrow();
    });

    // test 5 --------------------------
    test("should fail when defaultDurationMinutes is not in 5-minute interval", async() => {
        const service = new Service({
            ...validServiceData(),
            defaultDurationMinutes: 89
        });
        await expect(service.validate()).rejects.toThrow(
            "defaultDurationMinutes must be in 5-minute interval"
        )
    });

    // test 6 --------------------------
    test("status_default should be active", async() => {
        const service = new Service(validServiceData());
        await expect(service.status).toBe("active");
    });

    // test 7 --------------------------
    test("should fail when status value is invalid", async() => {
        const service = new Service({
            ...validServiceData(),
            status: "stopped"
        });
        await expect(service.validate()).rejects.toThrow();
    })
})