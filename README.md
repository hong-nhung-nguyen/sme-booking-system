# SME Booking System

A full-stack booking and queue-management application for service-based small and medium-sized businesses. The project provides an authenticated operations dashboard for managing appointments, viewing a live daily schedule, processing customer messages with AI-assisted intent extraction, and synchronising bookings with Google Calendar.

The current interface is restaurant-focused, but the data model and tenant-scoped API are designed to support other appointment-based businesses.

## Current functionality

- Cookie-based login, session refresh, logout, and current-user lookup
- Multi-tenant API access scoped by business and permitted locations
- Daily appointment schedule grouped by resource or table
- Appointment creation, editing, soft deletion, status changes, and status history
- Capacity-aware resource allocation for appointment requests
- Location-specific service lookup
- Customer and incoming-message persistence
- Structured message-intent extraction using the OpenAI API
- Google Calendar OAuth connection and appointment event creation
- In-memory MongoDB tests for the AI intent parser

The message inbox UI currently uses local demonstration conversations. The backend inbound-message endpoint and AI parser are implemented, but they are not yet connected to that screen.

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 8 |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose 9 |
| Authentication | JWT, HTTP-only cookies, bcrypt |
| Validation | Joi and Zod |
| Integrations | OpenAI API, Google Calendar API |
| Testing | Jest, MongoDB Memory Server |
| Tooling | npm workspaces, Nodemon, Oxlint |

## Repository structure

```text
sme-booking-system/
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── api/v1/        # Routes, controllers, and request validation
│   │   ├── config/        # Database, OAuth, Jest, and route configuration
│   │   ├── middlewares/   # Authentication, rate limiting, and validation
│   │   ├── models/        # Mongoose models and embedded schemas
│   │   ├── prompts/       # AI prompt construction
│   │   ├── repository/    # Database access
│   │   ├── services/      # Booking, messaging, AI, and calendar logic
│   │   └── utils/         # Token utilities
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── app/           # Application routes
│   │   ├── features/      # Auth, schedule, and messaging features
│   │   └── shared/        # API client and shared UI
│   ├── vite.config.js
│   └── vercel.json
├── package.json
└── README.md
```

## Prerequisites

- Node.js compatible with Vite 8 (Node.js 20.19+ or 22.12+)
- npm
- A local or hosted MongoDB database
- An OpenAI API key to enable message-intent extraction
- Google OAuth credentials to enable Google Calendar integration

## Local setup

1. Install all workspace dependencies from the repository root:

   ```bash
   npm install
   ```

2. Create `backend/.env`:

   ```dotenv
   PORT=3000
   NODE_ENV=development
   MONGO_URL=mongodb://127.0.0.1:27017/sme-booking-system
   ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret

   # Required for AI message-intent extraction
   OPENAI_API_KEY=your-openai-api-key

   # Required only for Google Calendar integration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/google-calendar/callback
   GOOGLE_OAUTH_STATE_SECRET=replace-with-another-long-random-secret
   ```

3. Start the backend:

   ```bash
   npm run dev:backend
   ```

4. In another terminal, start the frontend:

   ```bash
   npm run dev:frontend
   ```

5. Open `http://localhost:5173`.

Vite proxies `/api` requests to `http://localhost:3000` during local development. To use a different API host, create `frontend/.env` and set:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Creating a user

There is no database seeder or registration screen yet. Create a user through the registration endpoint before signing in:

```bash
curl -X POST http://localhost:3000/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "YOUR_BUSINESS_OBJECT_ID",
    "locationIds": ["YOUR_LOCATION_OBJECT_ID"],
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "phone": "0400000000",
    "role": "owner",
    "password": "change-me"
  }'
```

The referenced business and location records must already exist in MongoDB. A restaurant data example is available in `backend/src/docs/database/sample/restaurant-mock-data.js`, but it is a reference module rather than an executable seed command.

## Available scripts

Run these from the repository root:

| Command | Description |
| --- | --- |
| `npm start` | Start the backend with Nodemon |
| `npm run dev` | Start the backend in development mode |
| `npm run dev:backend` | Start the backend on the configured `PORT` |
| `npm run dev:frontend` | Start the Vite development server |
| `npm test` | Run backend tests |
| `npm run test:coverage` | Run backend tests with coverage thresholds |

Frontend-only commands can be run with npm's prefix option:

```bash
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix frontend run preview
```

## API overview

All endpoints are prefixed with `/api/v1`.

| Method and path | Purpose | Authentication |
| --- | --- | --- |
| `POST /auth/login` | Sign in and set access/refresh cookies | No |
| `POST /auth/refresh` | Refresh the access-token cookie | Refresh cookie |
| `POST /auth/logout` | Revoke the refresh token and clear cookies | Refresh cookie |
| `GET /auth/me` | Return the signed-in user | Yes |
| `POST /user/register` | Create a user | No |
| `GET /platform/tenants` | List businesses | No |
| `GET /business/appointments` | List tenant appointments | Yes |
| `GET /business/appointments/detail/:appointmentId` | Get an appointment | Yes |
| `POST /business/appointments/create` | Create an appointment | Yes |
| `PATCH /business/appointments/edit/:appointmentId` | Edit an appointment | Yes |
| `DELETE /business/appointments/delete/:appointmentId` | Soft-delete an appointment | Yes |
| `PATCH /business/appointments/change-status/:status/:appointmentId` | Change appointment status | Yes |
| `GET /business/appointments/status-history/:appointmentId` | Get status history | Yes |
| `GET /business/locations/:locationId/services` | List services for a location | Yes |
| `POST /message/inbound` | Store and interpret an incoming message | Yes |
| `GET /google-calendar/auth` | Start Google OAuth | Yes |
| `GET /google-calendar/callback` | Complete Google OAuth | OAuth state |
| `DELETE /google-calendar/disconnect` | Disconnect Google Calendar | Yes |
| `GET /google-calendar/events` | List calendar events | Yes |

Protected requests use the `accessToken` HTTP-only cookie. The frontend API client automatically attempts one refresh and retries a request after a `401` response.

## Testing

Run the backend test suite:

```bash
npm test
```

Run it with coverage:

```bash
npm run test:coverage
```

The current Jest configuration collects coverage from the AI intent-parser service and enforces global minimums of 85% for lines, 70% for functions, and 60% for branches. Tests use MongoDB Memory Server, so they do not write to the development database.

## Application routes

| Frontend route | Screen |
| --- | --- |
| `/login` | Staff sign-in |
| `/schedule-calendar` | Daily booking schedule and new-reservation workflow |
| `/messages` | AI-assisted messaging prototype |

Unknown frontend paths display a not-found page. The root path redirects to `/login`.

## Deployment notes

The frontend includes a Vercel configuration that:

- rewrites `/api/v1/*` to the deployed backend;
- routes other paths to `index.html` for client-side routing.

Update `frontend/vercel.json` if the backend deployment URL changes. Production authentication depends on cookies, so frontend/backend origins and cookie security settings must be reviewed together before deployment.

## Project status

This is an active development project. Core authentication, appointment APIs, schedule UI, AI intent parsing, and Google Calendar integration are present. Remaining product work includes connecting the message inbox to live backend data, adding user/business onboarding and seed tooling, protecting frontend routes, expanding test coverage, and completing currently placeholder navigation actions.
