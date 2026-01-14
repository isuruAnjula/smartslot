# SmartSlot

A full-stack appointment booking system with admin-managed availability and real-time slot generation.

## Features

### User
- Register / Login (JWT auth)
- View available time slots for a selected date
- Create a booking from a slot
- View “My Bookings”
- Cancel a booking (cancelled slots become available again)

### Admin
- Set weekly availability (day, start/end time, slot duration, closed days)
- View all bookings
- (Optional) Update booking status (confirmed / completed / cancelled)

## Tech Stack
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas + Mongoose
- **Validation:** Zod
- **Auth:** JWT + HTTP-only cookies (or token-based, depending on your setup)

## Architecture
- `apps/api` → Express API (MongoDB, auth, bookings, availability, slots)
- `apps/web` → Next.js web app (pages for auth, bookings, admin)

## API Endpoints (Core)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout` *(if implemented)*

### Availability
- `GET /api/availability` *(public)*
- `POST /api/availability` *(admin)*

### Slots
- `GET /api/slots?date=YYYY-MM-DD&tzOffsetMinutes=###` *(public)*  
  Returns available slots based on weekly availability + existing bookings.

### Bookings
- `POST /api/bookings` *(auth)* — create booking from slot
- `GET /api/bookings/mine` *(auth)* — list user bookings
- `PATCH /api/bookings/:id/cancel` *(auth; owner/admin)* — cancel booking
- `GET /api/bookings/admin` *(admin)* — list all bookings

## Getting Started (Local)

### 1) Clone
```bash
git clone https://github.com/isuruAnjula/smartslot.git
cd smartslot
