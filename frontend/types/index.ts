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
}

export interface HotelPublicResponse {
  id: string;
  name: string;
  location: string;
}

// --- Room ---
export interface CreateRoomRequest {
  name: string;
  price: number;
  totalRooms: number;
  maxGuests: number;
}

export interface RoomResponse {
  id: string;
  hotelId: string;
  name: string;
  price: number;
  totalRooms: number;
  maxGuests: number;
}

export interface RoomGlobalResponse {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  name: string;
  price: number;
  totalRooms: number;
  maxGuests: number;
}

// --- Booking ---
export interface CreateBookingRequest {
  roomId: string;
  checkIn: string; // ISO date string YYYY-MM-DD
  checkOut: string;
}

export interface BookingResponse {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

// --- Subscription ---
export type SubscriptionPlan = 'Basic' | 'Standard' | 'Premium';

export interface CreateSubscriptionRequest {
  planType: SubscriptionPlan;
  expiryDate: string; // ISO date string
}

export interface SubscriptionResponse {
  id: string;
  hotelId: string;
  planType: SubscriptionPlan;
  expiryDate: string;
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

