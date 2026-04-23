You are building a full-stack multi-tenant Hotel SaaS platform.

This system includes BOTH backend and frontend development, but they must stay strictly aligned with the same domain rules, entities, and business logic.

---

# 📁 PROJECT STRUCTURE

The project contains:

/Backend   → ASP.NET Core Web API (.NET 8)
/Frontend  → Next.js (App Router)

Both systems must always stay synchronized in domain logic and API contracts.

---

# 👥 USER ROLES (GLOBAL)

There are 3 user types:

## 1. SYSTEM_ADMIN

* Creates hotels
* Manages subscriptions
* Controls SaaS platform

## 2. HOTEL_OWNER

* Manages their own hotel
* Creates room types
* Manages rooms & inventory

## 3. CUSTOMER

* Browses hotels
* Browses rooms globally
* Can book any available room across any hotel

---

# 🏨 CORE SYSTEM DESIGN

This is NOT a simple hotel listing system.

It is a **flexible global marketplace with SaaS hotel management + unified room browsing system**.

---

# 🧠 CRITICAL BUSINESS MODEL CHANGE

Unlike traditional systems:

👉 CUSTOMER does NOT need to select a hotel first

Instead, the system supports:

## 1. HOTEL VIEW

* List all hotels
* View hotel details

## 2. ROOM VIEW (GLOBAL MARKETPLACE VIEW)

* List ALL rooms from ALL hotels
* Filter by:

  * price
  * features
  * capacity
  * location (via hotel)
* Customer can book ANY room directly

---

# 🧱 CORE ENTITIES (SHARED LOGIC FOR FRONTEND + BACKEND)

## User

* Id
* Name
* Email
* Role

## Hotel

* Id
* Name
* OwnerId
* Location

## RoomType

* Id
* HotelId
* Name
* BasePrice
* MaxGuests

## Room

* Id
* RoomTypeId
* HotelId
* RoomNumber
* AvailabilityStatus

## RoomFeature

* Id
* Name (e.g. pool, sea_view, jacuzzi)

## Subscription

* Id
* HotelId
* PlanType
* ExpiryDate

## Booking

* Id
* UserId
* RoomId
* CheckIn
* CheckOut
* Status

---

# 🔐 AUTHENTICATION (SHARED RULE)

* JWT-based authentication
* Role included in token
* HotelOwner includes hotel_id
* All systems must rely on backend for auth validation

---

# 🧩 SYSTEM ADMIN FEATURES

SystemAdmin can:

## 1. ADD HOTEL

* Create hotel
* Assign hotel owner
* Activate/deactivate hotel

## 2. SUBSCRIPTION MANAGEMENT

* Assign subscription plan to hotel
* Upgrade/downgrade plans
* Track expiration

---

# 🏨 HOTEL OWNER FEATURES

HotelOwner can:

* Create RoomTypes
* Assign features to rooms
* Manage inventory
* View bookings for their hotel only

---

# 🌍 CUSTOMER FEATURES (IMPORTANT)

Customer can:

## HOTEL VIEW

* Browse all hotels
* View hotel details

## ROOM VIEW (GLOBAL SYSTEM)

* Browse ALL rooms across ALL hotels
* Apply filters:

  * price range
  * features (pool, sea_view, etc.)
  * guest capacity
  * location

## BOOKING

* Select any room directly
* Choose dates
* Create booking

---

# 🔗 BACKEND RULES (MANDATORY FOR BOTH SIDES)

Backend must enforce:

* Multi-tenancy (hotel_id separation)
* Role-based access control
* Booking availability validation
* No overbooking allowed
* Subscription must be active for hotel operations

---

# 📡 API DESIGN PRINCIPLE (IMPORTANT)

Frontend and backend MUST share:

* Same entity structure
* Same DTO structure
* Same naming conventions

Frontend must NOT guess API behavior.

Backend must define all business rules.

---

# 🧠 GLOBAL ROOM MARKET LOGIC

A key feature:

👉 Rooms are globally searchable across hotels

This means backend must support:

* GET /rooms (global)
* Filtering across hotels
* Sorting by price, capacity, features

Frontend must support:

* Room listing page independent of hotel
* Advanced filtering UI

---

# 🔄 SUBSCRIPTION RULE (SYSTEM_ADMIN CONTROL)

* Hotels operate only if subscription is active
* Expired subscription:

  * disables room creation
  * disables booking visibility (optional rule)

---

# 🎨 FRONTEND REQUIREMENTS

Frontend must include:

* Hotel listing page
* Global room marketplace page
* Booking flow
* Role-based dashboards

Dashboards:

## CUSTOMER

* Browse hotels
* Browse rooms globally
* My bookings

## HOTEL_OWNER

* Room management
* Booking management

## SYSTEM_ADMIN

* Hotel creation
* Subscription management

---

# ⚙️ BACKEND REQUIREMENTS

Backend must include:

* Clean architecture
* Repository pattern
* Service layer
* DTO separation
* JWT authentication
* EF Core with PostgreSQL

---

# 🧠 CRITICAL DESIGN RULE

This system is NOT hotel-first.

It is:

👉 “Room-first global marketplace + SaaS hotel management layer”

---

# 🎯 SUCCESS CRITERIA

System must allow:

* Admin to add hotels
* Admin to manage subscriptions
* Hotel owners to manage rooms
* Customers to browse ALL rooms globally
* Customers to book any room directly
* Role-based access control enforced
* No data leakage between hotels

---

# ⚠️ STRICT RULES

* DO NOT hardcode API mismatches
* DO NOT separate frontend/backend logic rules
* DO NOT assume missing endpoints
* DO NOT break multi-tenant isolation
* DO NOT mix responsibilities across roles

---

Build backend and frontend as a single coherent SaaS system with shared domain understanding.
