import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  role: string;
}

const PUBLIC_PATHS = ['/', '/login', '/register'];

const ROLE_PATHS: Record<string, string[]> = {
  '/dashboard/admin': ['SUPER_ADMIN'],
  '/dashboard/owner': ['HOTEL_OWNER', 'SUPER_ADMIN'],
  '/dashboard/customer': ['CUSTOMER', 'SUPER_ADMIN'],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('hotel_booking_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based protection
    for (const [path, roles] of Object.entries(ROLE_PATHS)) {
      if (pathname.startsWith(path) && !roles.includes(payload.role)) {
        return NextResponse.redirect(new URL('/access-denied', request.url));
      }
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/hotels/:path*', '/booking/:path*'],
};
