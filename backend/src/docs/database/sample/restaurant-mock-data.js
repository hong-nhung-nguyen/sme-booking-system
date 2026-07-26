/**
 * Restaurant development seed sample
 *
 * Scope:
 * - 1 Business
 * - 1 Location
 * - 3 Users: owner, manager, staff
 * - Opening hours for a weekly restaurant schedule
 * - 1 FloorPlan with sections
 * - Resources for a restaurant setup
 * - 3 Services: breakfast, lunch, dinner
 * - 3 Clients
 *
 * Notes:
 * - This intentionally ignores unrelated collections.
 * - The current `Location` schema stores a single `openingHours` reference, so the
 *   sample keeps one representative working-day record in `location.openingHours`
 *   and includes the full weekly schedule in the `openingHours` array below.
 */

const businessId = "6a54f8c84595488194204f68";
const locationId = "6a54ff244595488194204f70";
const floorPlanId = "6a55065137eda25a235e2d08";

const ownerId = "6880f0f6b8bb0c4d4d2d0004";
const managerId = "6880f0f6b8bb0c4d4d2d0005";
const staffId = "6880f0f6b8bb0c4d4d2d0006";

const breakfastServiceId = "6a54f9fd4595488194204f6b";
const lunchServiceId = "6a54f9fd4595488194204f6c";
const dinnerServiceId = "6a54f9fd4595488194204f6d";

const client1Id = "6880f0f6b8bb0c4d4d2d0010";
const client2Id = "6880f0f6b8bb0c4d4d2d0011";
const client3Id = "6880f0f6b8bb0c4d4d2d0012";

const mondayHoursId = "6a55000b4595488194204f73";
const tuesdayHoursId = "6a55000b4595488194204f74";
const wednesdayHoursId = "6a55000b4595488194204f75";
const thursdayHoursId = "6a55000b4595488194204f76";
const fridayHoursId = "6a55000b4595488194204f77";
const saturdayHoursId = "6a55000b4595488194204f78";
const sundayHoursId = "6a55000b4595488194204f79";

const sectionFrontId = "6a5639afd9f5ad602f94d37b";
const sectionMainId = "6a5639afd9f5ad602f94d37c";
const sectionOutsideId = "6a5639afd9f5ad602f94d37d";

const resourceTable1Id = "6880f0f6b8bb0c4d4d2d0024";
const resourceTable2Id = "6880f0f6b8bb0c4d4d2d0025";
const resourceTable3Id = "6880f0f6b8bb0c4d4d2d0026";
const resourceTable4Id = "6880f0f6b8bb0c4d4d2d0027";
const resourceBooth1Id = "6880f0f6b8bb0c4d4d2d0028";
const resourceBooth2Id = "6880f0f6b8bb0c4d4d2d0029";
const resourcePatio1Id = "6880f0f6b8bb0c4d4d2d0030";

const restaurantMockData = {
    business: {
        _id: businessId,
        name: "Sunset Bistro",
        email: "hello@sunsetbistro.com.au",
        phone: "+61 412 345 678",
        status: "active"
    },

    location: {
        _id: locationId,
        businessId,
        name: "Sunset Bistro - Sydney CBD",
        phone: "+61 412 345 679",
        address: {
            street: "12 Market Street",
            suburb: "Sydney",
            state: "NSW",
            postcode: "2000",
            country: "Australia"
        },
        timezone: "Australia/Sydney",
        maxCapacity: 40,
        services: [
            { serviceId: breakfastServiceId, price: 18 },
            { serviceId: lunchServiceId, price: 26 },
            { serviceId: dinnerServiceId, price: 42 }
        ],
        timeslots: [
            {
                serviceId: breakfastServiceId,
                slots: ["08:00", "08:30", "09:00", "09:30", "10:00"]
            },
            {
                serviceId: lunchServiceId,
                slots: ["12:00", "12:30", "13:00", "13:30", "14:00"]
            },
            {
                serviceId: dinnerServiceId,
                slots: ["18:00", "18:30", "19:00", "19:30", "20:00"]
            }
        ],
        status: "active"
    },

    users: [
        {
            _id: ownerId,
            businessId,
            locationIds: [locationId],
            firstName: "Alex",
            lastName: "Nguyen",
            email: "alex@sunsetbistro.com.au",
            phone: "+61 400 111 001",
            passwordHash: "hash-owner-placeholder",
            role: "owner",
            accessAllLocations: true,
            status: "active"
        },
        {
            _id: managerId,
            businessId,
            locationIds: [locationId],
            firstName: "Jamie",
            lastName: "Park",
            email: "jamie@sunsetbistro.com.au",
            phone: "+61 400 111 002",
            passwordHash: "hash-manager-placeholder",
            role: "manager",
            accessAllLocations: false,
            status: "active"
        },
        {
            _id: staffId,
            businessId,
            locationIds: [locationId],
            firstName: "Mina",
            lastName: "Tran",
            email: "mina@sunsetbistro.com.au",
            phone: "+61 400 111 003",
            passwordHash: "hash-staff-placeholder",
            role: "staff",
            accessAllLocations: false,
            status: "active"
        }
    ],

    openingHours: [
        {
            _id: mondayHoursId,
            businessId,
            locationId,
            type: "businessDay",
            day: "monday",
            openTime: "08:00",
            closeTime: "22:00"
        },
        {
            _id: tuesdayHoursId,
            businessId,
            locationId,
            type: "businessDay",
            day: "tuesday",
            openTime: "08:00",
            closeTime: "22:00"
        },
        {
            _id: wednesdayHoursId,
            businessId,
            locationId,
            type: "businessDay",
            day: "wednesday",
            openTime: "08:00",
            closeTime: "22:00"
        },
        {
            _id: thursdayHoursId,
            businessId,
            locationId,
            type: "businessDay",
            day: "thursday",
            openTime: "08:00",
            closeTime: "22:00"
        },
        {
            _id: fridayHoursId,
            businessId,
            locationId,
            type: "businessDay",
            day: "friday",
            openTime: "08:00",
            closeTime: "23:00"
        },
        {
            _id: saturdayHoursId,
            businessId,
            locationId,
            type: "businessDay",
            day: "saturday",
            openTime: "09:00",
            closeTime: "23:00"
        },
        {
            _id: sundayHoursId,
            businessId,
            locationId,
            type: "businessDay",
            day: "sunday",
            openTime: "09:00",
            closeTime: "20:00"
        }
    ],

    services: [
        {
            _id: breakfastServiceId,
            businessId,
            name: "Breakfast",
            defaultDurationMinutes: 60,
            price: 18,
            status: "active"
        },
        {
            _id: lunchServiceId,
            businessId,
            name: "Lunch",
            defaultDurationMinutes: 90,
            price: 26,
            status: "active"
        },
        {
            _id: dinnerServiceId,
            businessId,
            name: "Dinner",
            defaultDurationMinutes: 120,
            price: 42,
            status: "active"
        }
    ],

    clients: [
        {
            businessId: "6a54f8c84595488194204f68",
            firstName: "Chloe",
            lastName: "Wilson",
            email: "chloe.wilson@example.com",
            phone: "+61 400 222 001",
            notes: "Prefers a window seat for breakfast."
        },
        {
            businessId: "6a54f8c84595488194204f68",
            firstName: "Daniel",
            lastName: "Khan",
            email: "daniel.khan@example.com",
            phone: "+61 400 222 002",
            notes: "Regular lunch guest."
        },
        {
            businessId: "6a54f8c84595488194204f68",
            firstName: "Elaine",
            lastName: "Morris",
            email: "elaine.morris@example.com",
            phone: "+61 400 222 003",
            notes: "Requests a quiet table for dinner."
        }
    ],

    floorPlan: {
        _id: floorPlanId,
        businessId,
        locationId,
        status: "active",
        sections: [
            {
                _id: sectionBarId,
                name: "Bar",
                status: "active"
            },
            {
                _id: sectionDiningId,
                name: "Dining Room",
                status: "active"
            },
            {
                _id: sectionPrivateId,
                name: "Private Room",
                status: "active"
            },
            {
                _id: sectionPatioId,
                name: "Outdoor Patio",
                status: "active"
            }
        ],
        updatedBy: [
            {
                account_id: ownerId,
                updatedAt: "2026-07-13T10:00:00.000Z"
            }
        ]
    },

    resources: [
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37b",
            number: "R10",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37b",
            number: "R11",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37b",
            number: "R20",
            maxCapacity: 4,
            status: "available"
        },
                {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37b",
            number: "R21",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37b",
            number: "R30",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37b",
            number: "R40",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37c",
            number: "R50",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37c",
            number: "R51",
            maxCapacity: 2,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37c",
            number: "R52",
            maxCapacity: 2,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37c",
            number: "R53",
            maxCapacity: 6,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37c",
            number: "R60",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37c",
            number: "R61",
            maxCapacity: 2,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37c",
            number: "R70",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37c",
            number: "R71",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37c",
            number: "R72",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37c",
            number: "R73",
            maxCapacity: 2,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37d",
            number: "R1",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37d",
            number: "R2",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37d",
            number: "R3",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37d",
            number: "R1",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37d",
            number: "R4",
            maxCapacity: 4,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37d",
            number: "R5",
            maxCapacity: 6,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37d",
            number: "R6",
            maxCapacity: 6,
            status: "available"
        },
        {
            floorPlanId: "6a55065137eda25a235e2d08",
            sectionId: "6a5639afd9f5ad602f94d37d",
            number: "R7",
            maxCapacity: 2,
            status: "available"
        },
    ]
};

module.exports = restaurantMockData;
