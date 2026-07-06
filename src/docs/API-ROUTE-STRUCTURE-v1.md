# API Route Structure V1

## Purpose

This document defines the initial API route structure for the booking system.

The system is designed as a platform where multiple businesses can use the same backend. Because of this, routes are organised by access context rather than only by database model.

The main goal of this structure is to clearly separate:

- Public customer-facing routes
- Client routes
- Authentication routes
- Tenant/business dashboard routes
- Tenant admin routes
- User routes
- Platform-level SaaS admin routes

This helps keep the API scalable, easier to maintain, and safer for a multi-business system.

---

## Main Route Structure

```txt
routes/
├── public/
├── client/
├── auth/
├── tenant/
├── tenantAdmin/
├── user/
└── platform/
```

Each folder represents a different access level or usage context.

---

## Route Mounting

The route groups should be mounted in `routes/index.route.js`.

Then `server.js` will call use the routes via importing `routes/index.route.js`

```js
app.use("/api/v1/public", require("./routes/public"));
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/tenant", require("./routes/tenant"));
app.use("/api/v1/tenant-admin", require("./routes/tenantAdmin"));
app.use("/api/v1/platform", require("./routes/platform"));
```

This means each route folder controls a different API prefix.

Example:

```txt
routes/tenant/appointmentRoutes.js
```

would be mounted under:

```txt
/api/tenant
```

So an appointment endpoint may become:

```txt
GET /api/tenant/:businessId/appointments
```

---

## 1. `public/` Routes

The `public/` folder contains customer-facing routes.

These routes are used by customers or visitors who are not logged into the business dashboard.

Typical use cases:

- View a business public booking page
- View available services
- View available times
- Create a customer booking

Example endpoints:

```txt
GET  /api/public/businesses/:slug
GET  /api/public/businesses/:slug/services
GET  /api/public/businesses/:slug/availability
POST /api/public/businesses/:slug/bookings
```

Suggested files:

```txt
routes/public/
├── index.js
├── businessPublicRoutes.js
├── servicePublicRoutes.js
├── availabilityRoutes.js
└── bookingPublicRoutes.js
```

Notes:

- Public routes should only expose data that customers are allowed to see.
- Public routes should not expose internal business dashboard data.
- Public booking routes may still need validation and rate limiting.

---

## 2. `auth/` Routes

The `auth/` folder contains authentication-related routes.

These routes are used for login, registration, logout, and token handling.

Example endpoints:

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
```

Suggested files:

```txt
routes/auth/
├── index.js
└── authRoutes.js
```

Notes:

- Authentication routes should not be mixed with tenant routes.
- User role and access checks should happen after authentication.
- Login can support different user types, such as platform admins, business owners, staff, and possibly customers.

---

## 3. `tenant/` Routes

The `tenant/` folder contains normal business dashboard routes.

A tenant means one business using the SaaS platform.

For example:

```txt
Hair Salon A = one tenant
Dental Clinic B = one tenant
Massage Shop C = one tenant
```

These routes are used by business users or staff after login.

Typical use cases:

- Manage appointments
- Manage clients
- Manage services
- Manage locations
- Manage resources
- Manage opening hours
- View appointment status history
- Manage recurring appointments

Example endpoints:

```txt
GET  /api/tenant/:businessId/appointments
POST /api/tenant/:businessId/appointments
GET  /api/tenant/:businessId/clients
POST /api/tenant/:businessId/services
GET  /api/tenant/:businessId/locations
```

Suggested files:

```txt
routes/tenant/
├── index.js
├── appointmentRoutes.js
├── appointmentStatusHistoryRoutes.js
├── recurringAppointmentRoutes.js
├── clientRoutes.js
├── serviceRoutes.js
├── locationRoutes.js
├── openingHourRoutes.js
├── floorPlanRoutes.js
├── sectionRoutes.js
└── resourceRoutes.js
```

Notes:

- Tenant routes should usually include `:businessId`.
- Users must only access businesses they belong to.
- Query logic must filter records by `businessId`.

Example safe query:

```js
Appointment.find({
  businessId: req.params.businessId
});
```

Avoid:

```js
Appointment.find();
```

The second example is unsafe in a SaaS system because it may return data across multiple businesses.

---

## 4. `tenantAdmin/` Routes

The `tenantAdmin/` folder contains business owner or business manager routes.

These routes are still scoped to one business, but they require a higher permission level than normal staff routes.

Typical use cases:

- Manage staff
- Assign staff roles
- Update business settings
- View business reports
- Manage business-level permissions

Example endpoints:

```txt
GET  /api/tenant-admin/:businessId/staff
POST /api/tenant-admin/:businessId/staff
PUT  /api/tenant-admin/:businessId/staff/:userId/role
PUT  /api/tenant-admin/:businessId/settings
GET  /api/tenant-admin/:businessId/reports
```

Suggested files:

```txt
routes/tenantAdmin/
├── index.js
├── staffRoutes.js
├── roleRoutes.js
├── businessSettingsRoutes.js
└── reportRoutes.js
```

Notes:

- These routes are not for platform admins by default.
- These routes are for admins of one business only.
- A business owner should not be able to manage another business unless explicitly authorised.
- Staff users should not access these routes unless they have the correct role.

---

## 5. `platform/` Routes

The `platform/` folder contains platform-level SaaS admin routes.

These routes are for the owner or administrator of the entire SaaS platform.

Typical use cases:

- View all businesses
- Create or suspend businesses
- Manage subscription plans
- View platform-wide reports
- Manage platform admin users

Example endpoints:

```txt
GET  /api/platform/businesses
POST /api/platform/businesses
PUT  /api/platform/businesses/:businessId/status
GET  /api/platform/subscriptions
GET  /api/platform/system-reports
```

Suggested files:

```txt
routes/platform/
├── index.js
├── businessRoutes.js
├── subscriptionRoutes.js
├── planRoutes.js
├── platformUserRoutes.js
└── systemReportRoutes.js
```

Notes:

- Platform routes should not be used for normal business dashboard operations.
- Platform routes should require platform admin permissions.
- Business owners and staff should not access these routes.

---

## Tenant Isolation Rule

Because this is a SaaS system, tenant isolation is required.

Tenant isolation means one business must not be able to access another business’s data.

Most tenant-level collections should include a `businessId` field.

Examples:

```txt
Appointment
Client
Service
Location
OpeningHour
FloorPlan
Section
Resource
RecurringAppointment
AppointmentStatusHistory
```

Example model field:

```js
businessId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Business",
  required: true,
  index: true
}
```

Every tenant-level controller should check or filter by `businessId`.

Example:

```js
const appointments = await Appointment.find({
  businessId: req.params.businessId
});
```

This ensures the request only returns appointments for the selected business.

---

## Access Context Summary

```txt
public
Customer-facing booking routes.
No business dashboard login required.

auth
Login, register, logout, and token routes.

tenant
Normal business dashboard routes.
Used by business staff and business users.

tenantAdmin
Business owner or manager routes.
Used for business-level administration.

platform
SaaS platform owner/admin routes.
Used to manage the whole platform.
```

---

## Naming Rules

Use clear route names that describe the access context.

Recommended:

```txt
public
auth
tenant
tenantAdmin
platform
```

Avoid vague names:

```txt
user
admin
business
```

Reason:

- `user` is unclear because there are customers, staff, business owners, and platform admins.
- `admin` is unclear because there are tenant admins and platform admins.
- `business` can be confused with tenant-level routes or platform-level business management.

---

## Version 1 Scope

This V1 structure focuses on setting up the API folder organisation only.

Included in V1:

- Create main route folders
- Create `index.js` files for route grouping
- Mount route groups in the Express app
- Add placeholder route files where needed
- Document route responsibilities
- Establish tenant route patterns using `:businessId`

Not included in V1:

- Full controller implementation
- Full authentication logic
- Full role-based access control
- Full validation middleware
- Full API documentation for every endpoint

These can be added in later versions.

---

## Example Final Folder Structure

```txt
routes/
├── public/
│   ├── index.js
│   ├── businessPublicRoutes.js
│   ├── servicePublicRoutes.js
│   ├── availabilityRoutes.js
│   └── bookingPublicRoutes.js
│
├── auth/
│   ├── index.js
│   └── authRoutes.js
│
├── tenant/
│   ├── index.js
│   ├── appointmentRoutes.js
│   ├── appointmentStatusHistoryRoutes.js
│   ├── recurringAppointmentRoutes.js
│   ├── clientRoutes.js
│   ├── serviceRoutes.js
│   ├── locationRoutes.js
│   ├── openingHourRoutes.js
│   ├── floorPlanRoutes.js
│   ├── sectionRoutes.js
│   └── resourceRoutes.js
│
├── tenantAdmin/
│   ├── index.js
│   ├── staffRoutes.js
│   ├── roleRoutes.js
│   ├── businessSettingsRoutes.js
│   └── reportRoutes.js
│
└── platform/
    ├── index.js
    ├── businessRoutes.js
    ├── subscriptionRoutes.js
    ├── planRoutes.js
    ├── platformUserRoutes.js
    └── systemReportRoutes.js
```

---

## Acceptance Criteria

The V1 API route structure is complete when:

- The `routes/` folder exists.
- The route subfolders are created:
  - `public/`
  - `auth/`
  - `tenant/`
  - `tenantAdmin/`
  - `platform/`
- Each route subfolder has an `index.js` file.
- Route groups are mounted in `app.js` or `server.js`.
- Tenant-level route patterns include `:businessId` where appropriate.
- The backend starts without route import errors.
- Platform routes are separated from tenant routes.
- Public customer routes are separated from dashboard routes.
- This document is added under the `docs/` folder.

---

## Suggested Branch Name

```txt
feature/saas-route-structure
```

## Suggested Commit Message

```txt
Document API route structure v1
```