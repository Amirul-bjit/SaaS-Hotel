// --- Auth ---
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'HOTEL_OWNER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: string;
}

// --- Hotel ---
export interface CreateHotelRequest {
  name: string;
  location: string;
  ownerId?: string;
}

export interface HotelResponse {
  id: string;
  name: string;
  ownerId: string;
  location: string;
  isActive: boolean;
}

export interface HotelPublicResponse {
  id: string;
  name: string;
  location: string;
}

// --- Room Feature ---
export interface RoomFeatureDto {
  id: string;
  name: string;
  icon: string;
}

// --- Room Type ---
export interface CreateRoomTypeRequest {
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  featureIds: string[];
}

export interface UpdateRoomTypeRequest {
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  featureIds: string[];
}

export interface RoomTypeResponse {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  totalRooms: number;
  features: RoomFeatureDto[];
}

export interface RoomTypeGlobalResponse {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  totalRooms: number;
  availableRooms: number;
  features: RoomFeatureDto[];
}

// --- Room ---
export interface CreateRoomRequest {
  roomTypeId: string;
  roomNumber: string;
}

export interface RoomResponse {
  id: string;
  roomTypeId: string;
  roomTypeName: string;
  roomNumber: string;
}

// --- Booking ---
export interface CreateBookingRequest {
  roomTypeId: string;
  checkIn: string; // ISO date string YYYY-MM-DD
  checkOut: string;
}

export interface BookingResponse {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  roomTypeId: string;
  roomTypeName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

// --- Subscription ---
export type SubscriptionPlan = 'Basic' | 'Standard' | 'Premium';
export type BillingCycle = 'Monthly' | 'Yearly';

export interface CreateSubscriptionRequest {
  planType: SubscriptionPlan;
  billingCycle: BillingCycle;
}

export interface SubscriptionResponse {
  id: string;
  hotelId: string;
  planType: SubscriptionPlan;
  billingCycle: BillingCycle;
  startDate: string;
  expiryDate: string;
  lastPaymentDate: string | null;
  lastPaymentAmount: number;
  isActive: boolean;
  daysUntilExpiry: number;
  isInGracePeriod: boolean;
  planConfig: PlanConfigResponse | null;
}

export interface PlanConfigResponse {
  id: string;
  planType: SubscriptionPlan;
  maxRooms: number | null;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
}

export interface UpsertPlanConfigRequest {
  planType: SubscriptionPlan;
  maxRooms: number | null;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
}

// --- Auth State ---
export type UserRole = 'SUPER_ADMIN' | 'HOTEL_OWNER' | 'CUSTOMER';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  token: string;
  userId: string;
  hotelId?: string;
}

// --- User ---
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CreateOwnerRequest {
  name: string;
  email: string;
  password: string;
}

