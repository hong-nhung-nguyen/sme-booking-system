const mongoose = require("mongoose");
const Location = require("../../src/models/Location.model");
const { connectTestDb, clearTestDb, closeTestDb } = require("../setUp/testDb");

beforeAll(async() => {
    await connectTestDb();
    // create the indexes created in the schema 
    await Location.syncIndexes();
})

afterEach(async() => {
    await clearTestDb();
})

afterAll(async() => {
    await closeTestDb();
})

describe("Location model", () => {
    const validLocationData = () => (
        {
            businessId: new mongoose.Types.ObjectId(),
            name: "Bombora",
            phone: "0468316444",
            address: {
                street: "Porter Street",
                suburb: "North Wollongong",
                state: "NSW",
                postcode: "2500",
                country: "Australia"
            },
            openingHours: new mongoose.Types.ObjectId(),
            services: [
                {
                    serviceId: new mongoose.Types.ObjectId()
                },
                {
                    serviceId: new mongoose.Types.ObjectId(),
                    price: 25
                }
            ],
            timeslots: [
                {
                    serviceId: new mongoose.Types.ObjectId(),
                    slots: ["10:00", "11:00"]
                },
                {
                    serviceId: new mongoose.Types.ObjectId(),
                    slots: ["14:00"]
                }
            ]
        }
    );

    // test 1
    test("should pass validation with valid data", async() => {
        const location = new Location(validLocationData());
        await expect(location.validate()).resolves.toBeUndefined();
    });

    // test 2
    test("should fail when maxCapacity_default to be null", async() => {
        const location = new Location(validLocationData());
        await expect(location.maxCapacity).toBe(null);
    });

    // test 3
    test("should fail when maxCapacity less than 1", async() => {
        const location = new Location({
            ...validLocationData(),
            maxCapacity: 0
        });
        await expect(location.validate()).rejects.toThrow();
    });

    // test 4
    test("should fail when missing services", async() => {
        const data = validLocationData();
        delete data.services;

        const location = new Location(data);
        await expect(location.validate()).rejects.toThrow(
            "required at least one service"
        );
    });

    // test 5
    test("should fail when missing services serviceId", async() => {
        const location = new Location({
            ...validLocationData(),
            services: [
                {
                    price: 100
                }
            ]
        });
        await expect(location.validate()).rejects.toThrow();
    });

    // test 6
    test("should fail when timeslots contains duplicate slot times", async() => {
        const location = new Location({
            ...validLocationData(),
            timeslots: [
                {
                    serviceId: new mongoose.Types.ObjectId(),
                    slots: ["22:00", "22:00"]
                }
            ]
        });
        await expect(location.validate()).rejects.toThrow(
            "timeslots cannot contain duplicate times"
        )
    });

    // test 7
    test("should fail when timeslots slots does not match with the hh:mm format", async() => {
        const location = new Location({
            ...validLocationData(),
            timeslots: [
                {
                    serviceId: new mongoose.Types.ObjectId(),
                    slots: ["9:30"]
                }
            ]
        });
        await expect(location.validate()).rejects.toThrow();
    });

    // test 8
    test("should fail when status is invalid", async() => {
        const location = new Location({
            ...validLocationData(),
            status: "opening"
        });
        await expect(location.validate()).rejects.toThrow()
    });

    // test 9
    test("should fail when address is not sufficient", async() => {
        const location = new Location({
            ...validLocationData(),
            address: {
                street: "Porter street",
                suburb: "Wollongong",
                state: "NSW",
                country: "Australia"
            }
        });
        await expect(location.validate()).rejects.toThrow();
    })

    // test 10
    test("should fail when address.postcode does not match the format", async() => {
        const location = new Location({
            ...validLocationData(),
            address: {
                street: "Porter street",
                suburb: "Wollongong",
                state: "NSW",
                postcode: "225",
                country: "Australia"
            }
        });
        await expect(location.validate()).rejects.toThrow();
    });

    // test 11
    test("should fail when exists two locations with same phone", async() => {
        await Location.create(validLocationData());
        await expect(Location.create(validLocationData())).rejects.toThrow();
    })
})