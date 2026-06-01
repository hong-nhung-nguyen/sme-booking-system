const mongoose = require("mongoose");
const Appointment = require("../../src/models/Appointment.model");
const { connectTestDb, clearTestDb, closeTestDb } = require("../setUp/testDb");

beforeAll(async () => {
    await connectTestDb();
});

afterEach(async () => {
    await clearTestDb();
});

afterAll(async() => {
    await closeTestDb();
});

describe("Appointment Model", () => {
    const validAppointmentData = () => (
        {
            businessId: new mongoose.Types.ObjectId(),
            locationId: new mongoose.Types.ObjectId(),
            clientId: new mongoose.Types.ObjectId(),
            serviceId: new mongoose.Types.ObjectId(),
            startTime: new Date("2026-06-01T10:00:00.000Z"),
            endTime: new Date("2026-06-01T11:30:00.000Z"),
            partySize: 3
        }
    );

    // test 1 -----------------------------
    test("should pass validation with valid data", async () => {
        const appointment = new Appointment(validAppointmentData());
        await expect(appointment.validate()).resolves.toBeUndefined();
    });

    // test 2 -----------------------------
    test("should status_default to be requested", async () => {
        const appointment = new Appointment(validAppointmentData());
        await expect(appointment.status).toBe("requested");
    });

    // test 3 -----------------------------
    test("should fail when businessId missing", async () => {
        const data = validAppointmentData();
        delete data.businessId;

        const appointment = new Appointment(data);
        await expect(appointment.validate()).rejects.toThrow();
    });

    // test 4 -----------------------------
    test("should fail when status is invalid", async() => {
        const appointment = new Appointment({
            ...validAppointmentData(),
            status: "successful"
        });
        await expect(appointment.validate()).rejects.toThrow();
    });

    // test 5 -----------------------------
    test("should fail when endTime is before startTime", async() => {
        const appointment = new Appointment({
            ...validAppointmentData(),
            startTime: new Date("2026-06-01T10:00:00.000Z"),
            endTime: new Date("2026-06-01T09:30:00.000Z")
        });

        await expect(appointment.validate()).rejects.toThrow(
            "endTime must be after startTime"
        )
    });

    // test 6 -----------------------------
    test("should fail when partySize less than or equal to 0", async() => {
        const appointment = new Appointment({
            ...validAppointmentData(),
            partySize: 0
        });

        await expect(appointment.validate()).rejects.toThrow();
    });

    // test 7 -----------------------------
    test("should fail if missing both durationMinutes and endTime", async() => {
        const data = validAppointmentData();
        delete data.endTime;

        const appointment = new Appointment(data);
        await expect(appointment.validate()).rejects.toThrow();
    })

    // test 8 -----------------------------
    test("should fail when note length longer than 1000 characters", async() => {
        const appointment = new Appointment({
            ...validAppointmentData(),
            note: "a".repeat(1010)
        });

        await expect(appointment.validate()).rejects.toThrow();
    })
})