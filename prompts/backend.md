You are a senior backend architect. Build ONLY the backend for a multi-tenant Hotel Booking SaaS platform using ASP.NET Core Web API (.NET 8).

DO NOT generate frontend, Docker, or deployment. Focus ONLY on backend correctness and clean architecture.

---

# ⚙️ GOAL

Build a scalable SaaS backend where:

There are 3 user types:

* SUPER_ADMIN (system owner)
* HOTEL_OWNER (hotel manager)
* CUSTOMER (public user)

System supports:

* Hotel management
* Room management
* Inventory tracking
* Booking system
* Subscription system

---

# 🧱 ARCHITECTURE (MANDATORY CLEAN ARCHITECTURE)

Project structure MUST be:

/Backend
/HotelBooking.API        (Controllers only)
/HotelBooking.Application (Services + DTOs + Interfaces)
/HotelBooking.Domain      (Entities + Enums)
/HotelBooking.Infrastructure (DbContext + Repositories)

---

# 🚫 STRICT RULES

* Controllers MUST NOT contain business logic
* Services MUST contain business logic
* Repositories MUST ONLY handle database operations
* DbContext MUST NOT be used in Services directly
* No cross-layer violations allowed

---

# 🧑‍💼 USER ROLES (RBAC)

Define roles:

* SUPER_ADMIN
* HOTEL_OWNER
* CUSTOMER

JWT must include:

* user_id
* role
* hotel_id (only for HOTEL_OWNER)

---

# 🔐 AUTHENTICATION

Implement:

* JWT authentication
* Password hashing (BCrypt)
* Login / Register endpoints

Endpoints:

* POST /auth/register
* POST /auth/login

---

# 🏨 CORE DOMAIN ENTITIES

Define in Domain layer:

## User

* Id
* Name
* Email
* PasswordHash
* Role

## Hotel

* Id
* Name
* OwnerId

## Room

* Id
* HotelId
* Name
* Price
* TotalRooms

## Inventory

* Id
* RoomId
* Date
* AvailableCount

## Booking

* Id
* UserId
* HotelId
* RoomId
* CheckIn
* CheckOut
* Status

## Subscription

* Id
* HotelId
* PlanType
* ExpiryDate

---

# 🧠 MULTI-TENANCY RULE (CRITICAL)

Every hotel-related query MUST enforce:

hotel_id = current_user.hotel_id

NEVER allow cross-hotel data access.

---

# 📦 BUSINESS LOGIC REQUIREMENTS

## Booking Flow:

When creating booking:

1. Validate date range
2. Check inventory for each date
3. Ensure availability > 0
4. Use database transaction
5. Decrement inventory
6. Create booking
7. Return confirmation

Must prevent double booking under concurrency.

---

## Inventory Rule:

When room is created:

* Automatically generate inventory for next 30 days

---

# 🔁 ROLE-BASED BEHAVIOR

Same endpoint must behave differently:

GET /bookings

* CUSTOMER → only own bookings
* HOTEL_OWNER → hotel bookings only
* SUPER_ADMIN → all bookings

---

# 🔐 AUTHORIZATION SYSTEM

Use:

* JWT claims
* ASP.NET Policy-based authorization

Policies:

* CanManageHotel
* CanViewBookings
* IsSuperAdmin

NEVER trust frontend data.

---

# 🧱 APPLICATION LAYER

Create:

## DTOs:

* Auth DTOs
* Hotel DTOs
* Room DTOs
* Booking DTOs
* Subscription DTOs

## Services:

* AuthService
* HotelService
* RoomService
* BookingService
* SubscriptionService

All business logic MUST be in services.

---

# 🗄️ INFRASTRUCTURE LAYER

Implement:

* ApplicationDbContext (EF Core)
* Repository pattern for all entities
* Repository interfaces in Application layer
* Implementations in Infrastructure

Repositories:

* IUserRepository
* IHotelRepository
* IRoomRepository
* IBookingRepository
* IInventoryRepository
* ISubscriptionRepository

---

# 🌐 API LAYER (CONTROLLERS ONLY)

Controllers:

* AuthController
* HotelController
* RoomController
* BookingController
* SubscriptionController

Rules:

* ONLY call services
* NO business logic
* NO DB access

---

# 🔄 TRANSACTION SAFETY (IMPORTANT)

Booking creation MUST use database transaction:

* Prevent race conditions
* Ensure inventory consistency

---

# 🧪 SEED DATA

Create seed:

* 1 SUPER_ADMIN
* 1 HOTEL_OWNER with hotel
* 1 CUSTOMER
* sample rooms + inventory

---

# 📡 OUTPUT REQUIREMENTS

Generate:

1. Full ASP.NET solution structure
2. Domain layer (entities + enums)
3. Application layer (DTOs + services + interfaces)
4. Infrastructure layer (DbContext + repositories)
5. API layer (controllers only)
6. JWT authentication system
7. EF Core PostgreSQL configuration
8. Seed data

---

# 🎯 SUCCESS CRITERIA

After running the project:

* User can register/login
* HOTEL_OWNER can manage hotel + rooms
* CUSTOMER can book rooms
* SUPER_ADMIN can view all data
* No overbooking occurs
* Multi-tenancy is enforced
* Clean architecture is respected

---

# ⚠️ IMPORTANT

* DO NOT generate frontend
* DO NOT generate Docker
* DO NOT mix layers
* DO NOT skip repository pattern
* DO NOT put logic in controllers

Build step-by-step with clean, production-grade architecture.
