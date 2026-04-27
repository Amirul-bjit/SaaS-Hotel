# SaaS Hotel Booking — Feature Expansion Roadmap

> Based on audit of current features (April 2026). Organized by priority and domain.

---

## Current Feature Summary

- **Auth:** JWT, 3 roles (SuperAdmin, HotelOwner, Customer), BCrypt passwords
- **Hotels:** CRUD, one-per-owner, admin management
- **Rooms:** CRUD, global marketplace with filters (price, capacity, location)
- **Bookings:** Create/list with date-range inventory tracking, auto-confirm
- **Subscriptions:** Plan configs (Basic/Standard/Premium), billing cycles, per-hotel assignment
- **Frontend:** Role-based dashboards, booking flow, admin panels

---

## Phase 1 — Core Gaps (Complete What's Started)

### 1.1 Subscription Enforcement
- Block room creation when subscription is expired or inactive (done)
- Block new bookings for hotels with expired subscriptions
- Show warning banners to hotel owners approaching expiry
- Grace period (e.g., 7 days) before hard-blocking
- Auto-deactivate hotels when subscription lapses

### 1.2 Room Types & Amenities
- `RoomType` entity (Single, Double, Suite, Deluxe, etc.)
- `RoomFeature` / `Amenity` entity (WiFi, Pool, Sea View, AC, Parking, Breakfast, Gym, Spa)
- Many-to-many Room ↔ Feature relationship
- Filter rooms by amenities on marketplace
- Amenity icons on frontend room cards

### 1.3 Hotel Activation / Deactivation
- `IsActive` flag on Hotel entity
- SuperAdmin can activate/deactivate hotels
- Inactive hotels hidden from marketplace and booking
- Reactivation workflow

### 1.4 Booking Status Workflow
- Full status flow: `Pending → Confirmed → CheckedIn → CheckedOut → Completed`
- Add `Cancelled` and `NoShow` as terminal states
- Allow hotel owners to confirm/reject pending bookings
- Cancellation with inventory restoration (re-increment available count)
- Cancellation policy (free cancel before X days, penalty after)

### 1.5 Concurrency & Data Integrity
- Optimistic concurrency tokens on Inventory for double-booking prevention
- Explicit DB transactions on booking creation
- Row versioning on critical entities

---

## Phase 2 — Revenue & Monetization

### 2.1 Payment Integration
- Stripe/PayPal integration for real payments
- Payment entity: `Id, BookingId, Amount, Currency, Status, TransactionId, PaymentMethod, CreatedAt`
- Subscription payment automation (recurring billing via Stripe)
- Refund processing on cancellation
- Payment history for customers and owners
- Invoice generation (PDF)

### 2.2 Dynamic Pricing
- Seasonal pricing rules per room (peak/off-peak multipliers)
- Weekend/weekday rate differentiation
- Last-minute discount engine
- Early bird pricing (book X days ahead = Y% off)
- Price calendar view on frontend
- Bulk rate updates for hotel owners

### 2.3 Promo Codes & Discounts
- `PromoCode` entity: code, discount type (percentage/flat), max uses, expiry, min booking amount
- Hotel-specific or platform-wide promos
- Apply promo at booking checkout
- Usage tracking and analytics

### 2.4 Commission & Platform Fees
- Configurable platform commission per booking (percentage)
- Per-plan commission rates (Basic: 15%, Standard: 10%, Premium: 5%)
- Commission ledger tracking
- Payout management for hotel owners
- Revenue dashboard for SuperAdmin

---

## Phase 3 — Guest Experience

### 3.1 Reviews & Ratings
- `Review` entity: `Id, BookingId, UserId, HotelId, Rating (1-5), Comment, CreatedAt`
- Only allow reviews after checkout
- One review per booking
- Average rating display on hotel/room cards
- Owner response to reviews
- Review moderation by SuperAdmin

### 3.2 Guest Profiles
- Extended user profile: phone, address, nationality, ID document
- Guest preferences (floor preference, smoking/non-smoking, bed type)
- Booking history timeline
- Favorite/saved hotels
- Loyalty points system (earn points per booking, redeem for discounts)

### 3.3 Notifications System
- `Notification` entity: `Id, UserId, Type, Title, Message, IsRead, CreatedAt`
- Email notifications (booking confirmation, cancellation, reminders)
- In-app notification bell with unread count
- Notification preferences (opt-in/out per type)
- Check-in reminder (1 day before)
- Booking status change alerts
- Subscription expiry warnings to owners

### 3.4 Search & Discovery
- Full-text search across hotels and rooms
- Search by date range with real-time availability
- Map-based hotel discovery (Google Maps / Mapbox integration)
- "Nearby" hotels using geolocation
- Sort by: price, rating, distance, popularity
- Recently viewed hotels
- Search suggestions / autocomplete

### 3.5 Multi-Language & Currency
- i18n support (English, Spanish, French, Arabic, etc.)
- Currency conversion with live exchange rates
- Locale-aware date/number formatting
- RTL layout support

---

## Phase 4 — Hotel Owner Tools

### 4.1 Analytics Dashboard
- Occupancy rate (daily, weekly, monthly)
- Revenue charts (line/bar graphs over time)
- Booking trends and forecasting
- Average daily rate (ADR) metric
- Revenue per available room (RevPAR)
- Top-performing rooms
- Guest demographics breakdown
- Cancellation rate tracking

### 4.2 Inventory Management (Advanced)
- Bulk inventory updates (set availability for date ranges)
- Room block/unblock for maintenance
- Overbooking allowance configuration
- Inventory calendar view (visual grid)
- Auto-extend inventory generation beyond initial 30 days
- Inventory alerts (low availability warnings)

### 4.3 Staff Management
- `Staff` entity: `Id, HotelId, UserId, Role (Manager, Receptionist, Housekeeping), Permissions`
- Hotel owners can invite staff members
- Role-based permissions within a hotel (view bookings, manage rooms, etc.)
- Staff activity log

### 4.4 Room Management (Advanced)
- Room photos (image upload to S3/Azure Blob)
- Room descriptions (rich text)
- Room floor plan / number assignment
- Room status tracking: Available, Occupied, Maintenance, Cleaning
- Housekeeping task assignment and tracking
- Room comparison feature for guests

### 4.5 Channel Manager (Future)
- Sync availability with OTAs (Booking.com, Expedia, Airbnb)
- Unified calendar across channels
- Rate parity management
- Channel-specific pricing rules

---

## Phase 5 — Platform Administration

### 5.1 Audit Logging
- `AuditLog` entity: `Id, UserId, Action, EntityType, EntityId, OldValues, NewValues, Timestamp, IpAddress`
- Track all CRUD operations on sensitive entities
- Admin audit log viewer with filters
- Exportable audit reports

### 5.2 Tenant Onboarding Workflow
- Hotel owner self-service registration
- Onboarding wizard (create hotel → add rooms → choose plan → pay)
- Email verification on registration
- KYC document upload for hotel verification
- Admin approval queue for new hotels

### 5.3 Platform Analytics (SuperAdmin)
- Total revenue across all hotels
- Active vs churned subscriptions
- New user signups over time
- Booking volume trends
- Top hotels by revenue
- Subscription plan distribution (pie chart)
- Geographical heatmap of hotels
- System health metrics

### 5.4 Content Management
- Homepage banner/hero management
- Featured hotels curation
- Announcement system (platform-wide banners)
- FAQ / Help center management
- Terms of service and privacy policy editor

### 5.5 Support Ticket System
- `Ticket` entity: `Id, UserId, HotelId, Subject, Description, Status, Priority, AssignedTo, CreatedAt`
- Customers raise tickets for booking issues
- Hotel owners raise tickets for platform issues
- Ticket assignment and resolution workflow
- Canned responses for common issues
- SLA tracking

---

## Phase 6 — Technical Infrastructure

### 6.1 API & Architecture
- API versioning (`/api/v1/`, `/api/v2/`)
- Rate limiting per tenant (based on subscription plan)
- Response caching (Redis) for hotel listings and room search
- Pagination on all list endpoints (cursor-based)
- Global exception handling middleware with structured error responses
- Health check endpoints (`/health`, `/ready`)
- Request/response logging middleware
- CQRS pattern for complex query vs command separation

### 6.2 Authentication & Security
- Refresh token rotation (access + refresh token pair)
- OAuth2 social login (Google, Facebook, Apple)
- Two-factor authentication (2FA) via email/SMS
- Password reset flow (forgot password → email link → reset)
- Account lockout after failed attempts
- Session management (active sessions list, remote logout)
- API key authentication for B2B integrations
- CORS configuration per tenant

### 6.3 Background Jobs
- Hangfire or Quartz.NET for scheduled tasks
- Daily inventory auto-generation (extend 30-day window)
- Subscription expiry checker (nightly job)
- Booking reminder emails (1 day before check-in)
- No-show auto-detection (mark as NoShow after check-in date)
- Stale pending booking cleanup
- Database cleanup of old audit logs

### 6.4 File Storage
- Image upload service (Azure Blob / AWS S3 / MinIO)
- Hotel photos gallery
- Room photos (multiple per room)
- User avatar upload
- Invoice/receipt PDF storage
- Image compression and thumbnail generation

### 6.5 Caching Layer
- Redis integration for:
  - Session storage
  - Room availability cache
  - Search result caching
  - Rate limiting counters
  - Real-time inventory counts
- Cache invalidation strategy on data changes

### 6.6 Observability
- Structured logging (Serilog → Seq / ELK)
- Distributed tracing (OpenTelemetry)
- Application performance monitoring (APM)
- Error tracking (Sentry integration)
- Custom metrics (booking rate, API latency, error rate)
- Dashboard (Grafana)

---

## Phase 7 — Advanced Features

### 7.1 Real-Time Features
- SignalR WebSocket hub for:
  - Live booking notifications to hotel owners
  - Real-time inventory updates on search page
  - Live chat between guest and hotel
  - Admin live dashboard updates
- Booking countdown timer (hold room for 15 min during checkout)

### 7.2 Reporting & Export
- Booking reports (daily/weekly/monthly) in PDF/Excel
- Revenue reports per hotel
- Occupancy reports
- Guest reports
- Tax reports (GST/VAT breakdowns)
- Scheduled report delivery via email
- Custom report builder for owners

### 7.3 Mobile App Readiness
- RESTful API already suitable; add:
  - Push notification endpoints (FCM/APNs)
  - Device registration for push tokens
  - Mobile-specific DTOs (lighter payloads)
  - Deep linking support
  - Offline-first data sync patterns

### 7.4 Multi-Property Management
- Hotel chains / groups (one owner manages multiple hotels)
- Group-level analytics across properties
- Cross-property booking transfer
- Unified staff management across chain
- Chain-level subscription plans (enterprise tier)

### 7.5 AI / Smart Features
- Smart pricing recommendations based on demand patterns
- Chatbot for booking assistance
- Review sentiment analysis
- Demand forecasting per hotel/room
- Personalized hotel recommendations for guests
- Auto-categorize support tickets

### 7.6 Marketplace Extensions
- Experience/activity bookings (tours, spa, dining)
- Airport transfer booking
- Add-on services (extra bed, late checkout, minibar package)
- Package deals (room + breakfast + tour)
- Gift cards and vouchers

---

## Suggested Implementation Order

```
Phase 1 (Core Gaps)           ──► Foundation fixes, must-do before scaling
Phase 2 (Revenue)             ──► Monetization, critical for real SaaS
Phase 6.1-6.2 (Infra + Auth)  ──► Technical debt, security hardening
Phase 3.1-3.3 (Guest UX)      ──► Reviews, profiles, notifications
Phase 4.1-4.2 (Owner Tools)   ──► Analytics, inventory management
Phase 5 (Admin)               ──► Platform operations tooling
Phase 6.3-6.6 (Jobs, Cache)   ──► Scale readiness
Phase 3.4-3.5 (Search, i18n)  ──► Growth features
Phase 4.3-4.5 (Staff, Photos) ──► Operational maturity
Phase 7 (Advanced)             ──► Differentiation and competitive edge
```

---

## Entity Relationship Additions (Summary)

```
New Entities:
├── Payment             (1:1 with Booking)
├── Review              (1:1 with Booking)
├── RoomType            (1:M with Room)
├── Amenity             (M:M with Room)
├── PromoCode           (standalone, linked at booking)
├── Notification        (M:1 with User)
├── AuditLog            (standalone)
├── Staff               (M:1 with Hotel, 1:1 with User)
├── Ticket              (M:1 with User, optional Hotel)
├── GuestProfile        (1:1 with User)
├── LoyaltyPoints       (1:1 with User)
├── HotelPhoto          (M:1 with Hotel)
├── RoomPhoto           (M:1 with Room)
├── SeasonalPricing     (M:1 with Room)
├── CancellationPolicy  (M:1 with Hotel)
├── CommissionLedger    (M:1 with Booking)
└── HotelGroup          (1:M with Hotel)
```
