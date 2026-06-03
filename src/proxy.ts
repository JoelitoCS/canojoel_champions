import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/admin", "/dashboard", "/perfil"];
const adminRoutes = ["/admin"];

export async function proxy(request: NextRequest) {
  // NextAuth v5 usa un nombre de cookie diferente según el entorno
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    // NextAuth v5 en producción usa __Secure- prefix, en dev no
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });

  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));
  if (isAdmin && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/no-autoritzat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/perfil/:path*", "/perfil"],
};
