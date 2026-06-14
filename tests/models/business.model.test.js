const mongoose = require("mongoose");
const Business = require("../../src/models/Business.model");
const { connectTestDb, clearTestDb, closeTestDb } = require("../setUp/testDb");

beforeAll(async() => {
    await connectTestDb(),
    await Business.syncIndexes()
});

afterEach(async() => {
    await clearTestDb();
});

afterAll(async() => {
    await closeTestDb();
});

describe("Business model", () => {
    const validBusinessData = () => (
        {
            name: "Bombora",
            email: "bombora@gmail.com",
            phone: "0123456789"
        }
    );

    // test 1 --------------------------
    test("should pass validation with valid data", async() => {
        const business = new Business(validBusinessData());
        await expect(business.validate()).resolves.toBeUndefined();

        // status_default to be pending
        await expect(business.status).toBe("pending");
    });

    // test 2 --------------------------
    test("should fail when wrong email format", async() => {
        const business = new Business({
            ...validBusinessData(),
            email: "abc@"
        });
        await expect(business.validate()).rejects.toThrow();
    });

    // test 3 --------------------------
    test("should fail when wrong phone format", async() => {
        const business = new Business({
            ...validBusinessData(),
            phone: "oneTwoThree4567"
        });
        await expect(business.validate()).rejects.toThrow();
    });

    // test 4 --------------------------
    test("should fail when name is missing", async() => {
        const data = validBusinessData();
        delete data.name;

        const business = new Business(data);
        await expect(business.validate()).rejects.toThrow();
    });

    // test 5 --------------------------
    test("should fail when invalid status value", async() => {
        const business = new Business({
            ...validBusinessData(),
            status: "ongoing"
        });
        await expect(business.validate()).rejects.toThrow();
    });

    // test 6 --------------------------
    test("should fail when existing 2 same emails/phones", async() => {
        await Business.create(validBusinessData());
        await expect(Business.create(validBusinessData())).rejects.toThrow();
    });

    // test 7 --------------------------
    test("shoudl fail when name is too long", async() => {
        const business = new Business({
            ...validBusinessData(),
            name: "a".repeat(101),
        });
        await expect(business.validate()).rejects.toThrow();
    })
})

