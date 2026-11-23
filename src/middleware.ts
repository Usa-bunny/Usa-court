import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "rahasia-super-aman-123",
);

const roleRoutes: Record<string, string[]> = {
  penyewa: ["/jadwal", "/booking"],
  petugas: ["/daftar-booking", "/buat-booking"],
  admin: ["/lapangan", "/user", "/rekap", "/audit-log"],
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const path = request.nextUrl.pathname;

  if (!token) {
    const isProtected =
      Object.values(roleRoutes)
        .flat()
        .some((route) => path.startsWith(route)) || path === "/";
    if (isProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userRole = payload.role as string;

    if (path === "/login" || path === "/register") {
      if (userRole === "admin")
        return NextResponse.redirect(new URL("/lapangan", request.url));
      if (userRole === "petugas")
        return NextResponse.redirect(new URL("/daftar-booking", request.url));
      return NextResponse.redirect(new URL("/jadwal", request.url));
    }

    const allowedRoutes = roleRoutes[userRole] || [];
    const isAuthorized = allowedRoutes.some((route) => path.startsWith(route));

    if (!isAuthorized && path !== "/") {
      if (userRole === "admin")
        return NextResponse.redirect(new URL("/lapangan", request.url));
      if (userRole === "petugas")
        return NextResponse.redirect(new URL("/daftar-booking", request.url));
      return NextResponse.redirect(new URL("/jadwal", request.url));
    }
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
