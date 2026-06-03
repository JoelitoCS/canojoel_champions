import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutes que requereixen autenticació
const protectedRoutes = ["/admin", "/dashboard"];

// Rutes només per a ADMIN
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Comprova si la ruta necessita autenticació
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Comprova si la ruta és d'admin
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));
  if (isAdmin && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/no-autoritzat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
