import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "rahasia-super-aman-123",
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const path = request.nextUrl.pathname;

  if (path.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);

      if (path.startsWith("/dashboard/admin") && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (path.startsWith("/dashboard/petugas") && payload.role !== "petugas") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (path.startsWith("/dashboard/penyewa") && payload.role !== "penyewa") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
