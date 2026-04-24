import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  HotelResponse,
  HotelPublicResponse,
  CreateHotelRequest,
  RoomResponse,
  RoomGlobalResponse,
  CreateRoomRequest,
  BookingResponse,
  CreateBookingRequest,
  SubscriptionResponse,
  CreateSubscriptionRequest,
  PlanConfigResponse,
  UpsertPlanConfigRequest,
  SubscriptionPlan,
  UserResponse,
  CreateOwnerRequest,
} from '@/types';
import { getToken, clearAuth } from '@/lib/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth API ---
export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data).then((r) => r.data),
};

// --- Hotel API ---
export const hotelApi = {
  getAll: () =>
    apiClient.get<HotelResponse[]>('/hotels').then((r) => r.data),
  browse: () =>
    apiClient.get<HotelPublicResponse[]>('/hotels/browse').then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<HotelResponse>(`/hotels/${id}`).then((r) => r.data),
  create: (data: CreateHotelRequest) =>
    apiClient.post<HotelResponse>('/hotels', data).then((r) => r.data),
  delete: (id: string) =>
    apiClient.delete(`/hotels/${id}`),
};

// --- Room API ---
export interface RoomFilters {
  minPrice?: number;
  maxPrice?: number;
  minGuests?: number;
  location?: string;
}

export const roomApi = {
  getAll: (filters?: RoomFilters) => {
    const params = new URLSearchParams();
    if (filters?.minPrice != null) params.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice != null) params.append('maxPrice', String(filters.maxPrice));
    if (filters?.minGuests != null) params.append('minGuests', String(filters.minGuests));
    if (filters?.location) params.append('location', filters.location);
    const query = params.toString();
    return apiClient
      .get<RoomGlobalResponse[]>(`/rooms${query ? `?${query}` : ''}`)
      .then((r) => r.data);
  },
  getById: (id: string) =>
    apiClient.get<RoomGlobalResponse>(`/rooms/${id}`).then((r) => r.data),
  getByHotel: (hotelId: string) =>
    apiClient.get<RoomResponse[]>(`/hotels/${hotelId}/rooms`).then((r) => r.data),
  create: (hotelId: string, data: CreateRoomRequest) =>
    apiClient.post<RoomResponse>(`/hotels/${hotelId}/rooms`, data).then((r) => r.data),
};

// --- Booking API ---
export const bookingApi = {
  getAll: () =>
    apiClient.get<BookingResponse[]>('/bookings').then((r) => r.data),
  create: (data: CreateBookingRequest) =>
    apiClient.post<BookingResponse>('/bookings', data).then((r) => r.data),
};

// --- Subscription API ---
export const subscriptionApi = {
  get: (hotelId: string) =>
    apiClient.get<SubscriptionResponse>(`/subscriptions/${hotelId}`).then((r) => r.data),
  create: (hotelId: string, data: CreateSubscriptionRequest) =>
    apiClient
      .post<SubscriptionResponse>(`/subscriptions/${hotelId}`, data)
      .then((r) => r.data),
  update: (hotelId: string, data: CreateSubscriptionRequest) =>
    apiClient
      .put<SubscriptionResponse>(`/subscriptions/${hotelId}`, data)
      .then((r) => r.data),
};

// --- Plan Config API ---
export const planConfigApi = {
  getAll: () =>
    apiClient.get<PlanConfigResponse[]>('/subscriptions/plans').then((r) => r.data),
  getByPlan: (planType: SubscriptionPlan) =>
    apiClient.get<PlanConfigResponse>(`/subscriptions/plans/${planType}`).then((r) => r.data),
  upsert: (data: UpsertPlanConfigRequest) =>
    apiClient.put<PlanConfigResponse>('/subscriptions/plans', data).then((r) => r.data),
};

// --- User API ---
export const userApi = {
  getOwners: () =>
    apiClient.get<UserResponse[]>('/users/owners').then((r) => r.data),
  createOwner: (data: CreateOwnerRequest) =>
    apiClient.post<UserResponse>('/users/owners', data).then((r) => r.data),
  deleteOwner: (id: string) =>
    apiClient.delete(`/users/${id}`),
};

export default apiClient;
