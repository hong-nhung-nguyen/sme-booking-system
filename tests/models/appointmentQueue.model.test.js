const mongoose = require("mongoose");
const Appointment = require("../../src/models/Appointment.model");
const AppointmentQueue = require("../../src/models/AppointmentQueue.model");
const { connectTestDb, clearTestDb, closeTestDb } = require("../setUp/testDb");

beforeAll(async() => {
    await connectTestDb();
    await AppointmentQueue.syncIndexes();
});

afterEach(async() => {
    await clearTestDb();
});

afterAll(async() => {
    await closeTestDb();
});

describe("AppointmentQueue model", () => {
    const appointmentId = new mongoose.Types.ObjectId();
    const businessId = new mongoose.Types.ObjectId();
    const locationId = new mongoose.Types.ObjectId();
    const clientId = new mongoose.Types.ObjectId();
    const serviceId = new mongoose.Types.ObjectId();

    const validQueueData = () => (
        {
            businessId: businessId,
            locationId: locationId,
            clientId: clientId,
            serviceId: serviceId,
            matchedAppointmentId: appointmentId,
            requestedTime: new Date("2026-06-01T10:00:00.000Z"),
            partySize: 1,
            desiredTime: new Date("2026-06-01T12:00:00.000Z"),
            expiresAt: new Date("2026-06-01T11:30:00.000Z"),
        }
    );

    const validMatchedAppointmentData = () => (
        {
            _id: appointmentId,
            businessId: businessId,
            locationId: locationId,
            clientId: clientId,
            serviceId: serviceId,
            startTime: new Date("2026-06-01T12:00:00.000Z"),
            endTime: new Date("2026-06-01T13:30:00.000Z"),
            partySize: 1,
            status: "queued"
        }
    );

    // test 1
    test("should pass validation with valid queue data", async() => {
        const queue = new AppointmentQueue(validQueueData());
        await expect(queue.validate()).resolves.toBeUndefined();
    });

    // test 2
    test("should fail when queue cannot matched to a valid appointment document", async() => {
        const appointment = await Appointment.create(validMatchedAppointmentData());
        const queue = await AppointmentQueue.create(validQueueData());

        const linkFound = await AppointmentQueue.findById(appointment._id);
        expect(linkFound).toBeDefined();
    });

    // test 3
    test("should fail when requestedTime is missing", async() => {
        const data = validQueueData();
        delete data.requestedTime;

        const queue = new AppointmentQueue(data);
        await expect(queue.validate()).rejects.toThrow();
    });

    // test 4
    test("should fail when invalid priorityRate", async() => {
        const queue = new AppointmentQueue({
            ...validQueueData(),
            priorityRate: 2
        });
        await expect(queue.validate()).rejects.toThrow();
    });

    // test 5
    test("should fail when invalid status", async() => {
        const queue = new AppointmentQueue({
            ...validQueueData(),
            status: "rejected"
        });
        await expect(queue.validate()).rejects.toThrow();
    });

    // test 6
    test("should pass validation when status_default is queued", async() => {
        const queue = new AppointmentQueue(validQueueData());
        await expect(queue.status).toBe("queued");
    });

    // test 7
    test("should fail when expiresAt is before requestedTime", async() => {
        const queue = new AppointmentQueue({
            ...validQueueData(),
            expiresAt: new Date("2026-06-01T09:00:00.000Z"),
        });
        await expect(queue.validate()).rejects.toThrow(
            "expiresAt must be after requestedTime"
        )
    });

    // test 8
    test("should fail when note is longer than 1000 characters", async() => {
        const queue = new AppointmentQueue({
            ...validQueueData(),
            note: "a".repeat(1001)
        });
        await expect(queue.validate()).rejects.toThrow()
    })
})