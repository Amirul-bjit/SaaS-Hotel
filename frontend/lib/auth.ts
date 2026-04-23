import { AuthUser } from '@/types';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  user_id: string;
  role: string;
  hotel_id?: string;
  exp: number;
  iss: string;
  aud: string;
}

const TOKEN_KEY = 'hotel_booking_token';
const USER_KEY = 'hotel_booking_user';

export function saveAuth(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Sync to cookie for middleware route protection
  document.cookie = `${TOKEN_KEY}=${user.token}; path=/; SameSite=Lax`;
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Clear cookie
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getSavedUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const user: AuthUser = JSON.parse(raw);
    // Validate token not expired
    const payload = jwtDecode<JwtPayload>(user.token);
    if (payload.exp * 1000 < Date.now()) {
      clearAuth();
      return null;
    }
    return user;
  } catch {
    clearAuth();
    return null;
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

export function buildAuthUser(token: string, name: string, email: string, role: string): AuthUser {
  const payload = decodeToken(token);
  return {
    token,
    name,
    email,
    role: role as AuthUser['role'],
    userId: payload?.user_id ?? '',
    hotelId: payload?.hotel_id,
  };
}
