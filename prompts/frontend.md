You are a senior frontend engineer building a production-ready SaaS application using Next.js.

---

# 📁 PROJECT CONTEXT

You are working inside a monorepo with this structure:

/Backend   → Existing ASP.NET Core Web API (.NET 8) implementation (already completed)
/Frontend  → You must build this Next.js application

---

# 🔗 BACKEND REFERENCE RULE (VERY IMPORTANT)

The `/Backend` folder contains a fully implemented backend system.

Frontend must treat `/Backend` as the SINGLE SOURCE OF TRUTH for:

* API endpoints
* Request/response structures
* Authentication (JWT)
* Role-based access rules
* Business logic behavior

Frontend must NOT:

* Create fake APIs
* Guess endpoints
* Mock backend behavior
* Redefine business rules

Frontend must ONLY consume what exists in `/Backend`.

---

# ⚙️ TECH STACK

* Next.js (App Router using `create-next-app@latest`)
* TypeScript (strict mode)
* Tailwind CSS
* Axios for API communication

---

# 👥 USER ROLES (FROM BACKEND JWT)

The backend provides JWT authentication with roles:

* SUPER_ADMIN
* HOTEL_OWNER
* CUSTOMER

Frontend must dynamically render UI based on these roles.

---

# 🔐 AUTHENTICATION FLOW

* Use backend login/register APIs
* Receive JWT token from backend
* Attach JWT to all API requests
* Decode JWT for role-based UI rendering
* Handle token expiration gracefully (auto logout)

---

# 🌐 APPLICATION STRUCTURE (FRONTEND ONLY)

/Frontend
/app
/page.tsx → Landing page
/login
/register

```
/hotels
/booking

/dashboard
  /customer
  /owner
  /admin
```

/components
/lib
api.ts → Axios client
auth.ts → auth helpers
/types
/hooks

---

# 🧱 CORE FEATURES

## 1. PUBLIC HOTEL BROWSING

* Fetch hotels from backend
* Display hotel list
* Search and filter UI
* View hotel details and rooms

---

## 2. BOOKING FLOW (CRITICAL FEATURE)

Flow:

1. Select hotel room
2. Choose check-in and check-out dates
3. Send request to backend:
   POST /bookings
4. Display confirmation or error

Frontend must handle:

* unavailable rooms
* validation errors
* loading states

---

## 3. ROLE-BASED DASHBOARDS

### CUSTOMER

* View bookings
* Booking history

### HOTEL_OWNER

* View hotel dashboard
* Manage rooms (UI only, backend handles logic)
* View bookings for their hotel

### SUPER_ADMIN

* View all hotels
* View all users
* Manage subscriptions

---

# 🔐 ROUTE PROTECTION

Implement frontend route guards:

* If not authenticated → redirect to /login
* Role-based access:

  * CUSTOMER cannot access admin/owner dashboards
  * HOTEL_OWNER cannot access admin dashboard
  * SUPER_ADMIN has full access

---

# 📡 API LAYER (MANDATORY)

Create centralized API layer:

/lib/api.ts

Must:

* Use Axios
* Attach JWT token automatically
* Handle errors globally
* Point to backend at:
  http://localhost:5000

API groups:

* authApi
* hotelApi
* roomApi
* bookingApi
* subscriptionApi

---

# 🎨 UI REQUIREMENTS

* Clean SaaS-style UI
* Fully responsive design
* Tailwind CSS only
* Reusable components:

  * Button
  * Input
  * Card
  * Modal
  * Table

---

# 🧠 STATE MANAGEMENT

Use lightweight state solution:

* React Context OR Zustand

Store:

* user info
* JWT token
* role
* hotel_id (if applicable)

---

# 🔄 ERROR HANDLING

Frontend must handle:

* 401 → logout user
* 403 → access denied page
* network errors
* API validation errors
* loading states

---

# 🏁 SUCCESS CRITERIA

After implementation:

* Fully working Next.js frontend in `/Frontend`
* Connected to `/Backend` APIs
* JWT authentication works
* Role-based dashboards function correctly
* Customers can book hotels
* Hotel owners can manage their hotel UI
* Admin can view platform data
* No mocked or fake backend data

---

# ⚠️ STRICT RULES

* DO NOT implement backend logic
* DO NOT mock APIs
* DO NOT assume endpoints exist
* DO NOT hardcode role behavior without JWT
* DO NOT bypass backend rules

Frontend must be a pure client of `/Backend`.

---

Build a production-ready SaaS frontend that strictly integrates with the existing backend system.
