# BOOKING & QUEUE SYSTEM

A simple booking system for small and medium-sized businesses. Customers can reserve time slots, while the system helps prevent overbooking by managing capacity and queue limits.

The goal is to provide a practical alternative to booking tools that are either too basic or too complex:

- Basic calendar tools often lack capacity awareness, which can lead to conflicts during busy periods.
- Enterprise booking platforms can be expensive, bloated, and difficult for small businesses to manage.

This project focuses on a lightweight, practical workflow for businesses that need appointment booking, admin control, and queue management without unnecessary complexity.

---

## Overview

The Booking & Queue System is designed to solve a real business problem: helping service-based businesses manage customer appointments while keeping time slots and service capacity under control.

It can be adapted for different industries, such as:

- Hair salons and barbers
- Clinics and consultation services
- Repair shops
- Professional appointments
- Other small business service bookings

---

## Features

- Browse available services
- Book an appointment
- Manage bookings through an admin area
- Control capacity for each time slot
- Support queue-based booking when demand is high
- Reduce scheduling conflicts during busy periods

---

## Technology Used

- **Language:** JavaScript
- **Template Engine:** Pug
- **Framework:** Express.js
- **Database:** MongoDB
- **Tools:** Git, VS Code

---

## Current Project Structure

```text
sme-booking-system/
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── api/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── prompts/
│   │   ├── repository/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── public/
│   └── src/
├── package.json
├── README.md
└── .env
```

## Project Status

This project is currently in the planning and early development stage. The README describes the intended purpose, feature set, and structure of the application.