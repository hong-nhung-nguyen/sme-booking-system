# Model Testing Plan

---

## Purpose

Model tests verify that Mongoose schemas behave correctly and expectedly before API routes are built.

--- 

## What model tests cover

- Required fields working
- Enum values correct
- Min/max values applying
- Regex validation working
- Default values applying 
- Custom validators working
- Embedded subdocuments behaving correctly
- Discriminators not storing type properly and Polymorphism/Inheritance
- Important indexes working

---

## What model tests do not cover yet

- API request/response behaviour
- Joi request validation
- Controller logic
- Authentication and roles
- Query across collections 
- Public/business/client/platform route permissions 

Those will be tested later in service/API tests.

---

## Test command

```text
npm test
```

---

## Test folders

```text
tests/models/
tests/setup/testDb.js
```

---

## Current model test priority

### 1. Business

- [ ] valid document
- [ ] required name/email/phone
- [ ] invalid email/phone
- [ ] default status
- [ ] unique email if used 

### 2. Location

- [ ] required bussinessId/name/address/timezone
- [ ] maxCapacity min
- [ ] services/timeslots shape  

### 3. Service

- [ ] required businessId/name/defaultDurationMinutes
- [ ] duration multiple of 5
- [ ] price min 0
- [ ] status enum
- [ ] status default

4. OpeningHours / BusinessDay

- [ ] closed day without time
- [ ] open day requires time
- [ ] closeTime > openTime
- [ ] valid day enum
- [ ] dircriminator type

5. Appointment

- [ ] required refs
- [ ] status enum/default
- [ ] endTime > startTime
- [ ] partySize min 1
- [ ] embedded statusHistory

6. AppointmentQueue

- [ ] required appointmentId/business/location/service
- [ ] status enum/default
- [ ] priorityRate min max 
- [ ] expiresAt > requestedDateTime

7. FloorPlan / Section

- [ ] embedded sections validate
- [ ] section name required/unique
- [ ] maxCapacity min 1

8. Resource

- [ ] required sectionId/floorPlan/location
- [ ] capacity min 1
- [ ] status enum
- [ ] joinableResourceIds rules

9. RecurringAppointment

- [ ] frequency enum
- [ ] daysOfWeek required for weekly/fortnightly
- [ ] duplicate days rejected
- [ ] endDate >= startDate

10. IncomingMessage / ParseIntent

- [ ] channel enum
- [ ] body required
- [ ] subject required for email
- [ ] from/to format by channel


