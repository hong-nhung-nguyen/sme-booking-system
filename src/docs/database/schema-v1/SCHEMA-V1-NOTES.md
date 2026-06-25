# Database Schema Notes

## General

**Database type:** MongoDB / Mongoose  
**Schema version:** v1 
**Last updated:** 2026-06-02  
**Locked schema:** v1.4
**Phase:** 01 - Preliminary model building (before API build)

---

## 1. Purpose

This document explains the database schema-v1 design decisions for the SME Booking System.

It records:

- Main collections
- Relationships between collections
- Embedded vs separate collection decisions
- Important validation rules
- Indexing decisions
- Change history / audit decisions
- Future schema improvements

---

## 2. High-Level Design

The system uses a **shared database / shared collections** SaaS design.

All participating businesses are stored in the same database. Business-owned documents use `businessId` to separate tenant data.

Example:

```txt
sme-booking-system
├── businesses
├── locations
├── services
├── clients
├── appointments
├── appointmentQueues
├── recurringAppointments
├── openingHours
|   ├── businessDays
|   ├── publicHolidays
|   └── exceptionDates
├── floorPlans <- sections
├── resources
├── users
├── incomingMessages <- parseIntents
```

Most collections include:

```js
businessId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Business",
  required: true,
  index: true
}
```

---

## 3. Multi-Tenant Data Rule

For business-admin routes, the backend should use the authenticated user's `businessId`.

Do this:

```js
const businessId = req.user.businessId;
```

Avoid trusting this from the frontend:

```js
const businessId = req.body.businessId;
```

This prevents one business from accessing another business's data.

---

## 4. Collection Summary

| Collection | Purpose | Notes |
|---|---|---|
| `Business` | Stores SaaS customer businesses | Top-level tenant entity |
| `Location` | Stores branches/physical locations | Belongs to one business |
| `Service` | Stores services offered by a business | May have default duration/price |
| `Client` | Stores customer information | May belong to business or be linked through appointments |
| `Appointment` | Stores actual appointment records | Main booking collection |
| `AppointmentQueue` | Stores queued booking requests | Linked to appointment if using queue-ticket approach |
| `RecurringAppointment` | Stores recurrence rules | Generates appointment occurrences |
| `OpeningHours` | Stores business days, holidays, exceptions | Uses discriminators |
| `FloorPlan` | Stores layout per location | Embeds sections |
| `Resource` | Stores bookable tables/chairs/rooms/resources | Separate collection for fast queries |
| `User` | Stores business staff/admin users | Role-based access |
| `IncomingMessage` | Stores SMS/email/manual messages | Used for parsing booking requests |
| `ParseIntent` | Stores parsed intent from messages | Used for AI/message processing |

---

## 5. Embedded vs Separate Collections

### Embedded Schemas

These are embedded because they are small and usually loaded with the parent document.

| Embedded schema | Parent | Reason |
|---|---|---|
| `SectionSchema` | `FloorPlan` | Sections are part of one floor plan |
| `AppointmentStatusHistorySchema` | `Appointment` | Status history belongs to one appointment |
| `ChangeHistorySchema` | Important collections | Stores local audit history |

### Separate Collections

These are separate because they need independent querying, indexing, or references.

| Collection | Reason |
|---|---|
| `Resource` | Must be queried quickly for availability/capacity |
| `Appointment` | Core booking records need independent querying |
| `AppointmentQueue` | Queue processing needs fast lookup by business/location/status |
| `RecurringAppointment` | Recurrence rules generate many appointments |
| `OpeningHours` | Different types handled through discriminators |

---

## 6. OpeningHours Design

`OpeningHours` uses Mongoose discriminators and implements idea of Inheritance/Polymorphism.

Base collection:

```txt
openingHours
```

Base schema fields:

```txt
businessId
locationId
isClosed
openTime
closeTime
type
createdAt
updatedAt
```

Discriminator types:

```txt
businessDay
publicHoliday
exceptionDate
```

The discriminator key is:

```js
discriminatorKey: "type"
```

This means documents store:

```js
type: "businessDay"
```

or:

```js
type: "publicHoliday"
```

or:

```js
type: "exceptionDate"
```

### `isClosed` Meaning

```txt
isClosed = true  → closed all day, no openTime/closeTime
isClosed = false → open, openTime and closeTime required
```

---

## 7. Appointment Status Design

`Appointment.status` stores the current status.

`Appointment.statusHistory` stores the timeline of status changes.

Keep both.

```txt
status = current/latest status
statusHistory = past status changes
```

Example statuses:

```txt
requested
queued
unconfirmed
confirmed
rescheduled
cancelled
completed
noShow
failed
rejected
```

---

## 8. Change History Design

Important collections may use `changeHistory` or `updateHistory`.

Recommended reusable schema:

```js
const ChangeHistorySchema = new mongoose.Schema(
  {
    changes: [
      {
        field: {
          type: String,
          required: true,
          trim: true
        },
        oldValue: {
          type: mongoose.Schema.Types.Mixed
        },
        newValue: {
          type: mongoose.Schema.Types.Mixed
        }
      }
    ],

    updatedBy: {
      type: String,
      required: true,
      trim: true
    },

    updatedAt: {
      type: Date,
      default: Date.now
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  { _id: false }
);
```

Use `Mixed` for `oldValue` and `newValue` because changes can be:

```txt
String
Number
Boolean
Date
ObjectId
Array
null
```

---

## 9. Collections That Should Have Change History

Recommended:

```txt
Appointment
Business
Location
Client
Service
OpeningHours
RecurringAppointment
Resource
User
```

Use detailed change history mainly for important changes affecting:

```txt
booking correctness
availability
pricing
permissions
customer communication
```

---

## 10. Important Validation Rules

### General

Use Mongoose built-ins for:

```txt
required
enum
min
max
minlength
maxlength
match
default
trim
lowercase
```

Use custom `validate` for:

```txt
cross-field rules
conditional required logic
array uniqueness
date/time comparisons
```

### Examples

| Model | Field | Rule |
|---|---|---|
| `OpeningHours` | `closeTime` | Must be after `openTime` |
| `OpeningHours` | `openTime`, `closeTime` | Required only when `isClosed === false` |
| `RecurringAppointment` | `daysOfWeek` | Required for weekly/fortnightly recurrence |
| `RecurringAppointment` | `daysOfWeek` | Cannot contain duplicate days |
| `RecurringAppointment` | `dates` | Cannot contain duplicate dates |
| `Appointment` | `endTime` | Must be after `startTime` |
| `Location` | `services` | Must contain at least one service |
| `Location` | `timeslots.slots` | Cannot contain duplicate times |
| `Resource` | `joinableResourceIds` | Cannot contain duplicates or itself |

---

## 11. Indexing Decisions

Common indexes:

```js
Schema.index({ businessId: 1 });
Schema.index({ businessId: 1, status: 1 });
Schema.index({ businessId: 1, locationId: 1 });
```

### Unique Indexes

Use `unique: true` carefully.

`unique: true` only checks uniqueness inside the same collection.

For SaaS, prefer compound unique indexes when uniqueness should be per business.

Example:

```js
ServiceSchema.index(
  { businessId: 1, name: 1 },
  { unique: true }
);
```

This means:

```txt
Same business cannot have duplicate service names.
Different businesses can use the same service name.
```

---

## 12. Testing Notes

Model tests are stored in:

```txt
tests/models/
```

Testing setup is stored in:

```txt
tests/setup/testDb.js
```

Model tests use:

```txt
jest
mongodb-memory-server
```

Use `document.validate()` for schema validation tests.

Use `Model.create()` for database/index tests such as:

```txt
unique indexes
compound unique indexes
discriminator save behaviour
timestamps
```

Use `Model.syncIndexes()` before tests that rely on unique indexes.

---

## 13. Known Design Decisions

### Decision: One database for all businesses

Reason:

```txt
Simpler SaaS design
Easier migrations
Easier reporting
Easier onboarding
Use businessId for tenant separation
```

### Decision: FloorPlan embeds Sections

Reason:

```txt
Sections are small structural parts of one floor plan.
They are usually loaded with the floor plan.
```

### Decision: Resource is separate collection

Reason:

```txt
Resources need fast queries for availability, capacity, and booking.
```

### Decision: Appointment keeps both status and statusHistory

Reason:

```txt
status makes current-status queries fast.
statusHistory keeps audit trail.
```

---

## 14. Future Improvements

Possible future improvements:

- Add tenant-level subscription/plan limits
- Add stronger role/permission model
- Add migration scripts
- Add seed data for development
- Add API integration tests with Supertest
- Add service-layer availability tests
- Add appointment overlap tests

