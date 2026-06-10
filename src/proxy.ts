import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/admin", "/editor", "/perfil"];
const adminOnlyRoutes = ["/admin"];
const editorRoutes = ["/editor"];

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName:
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token",
  });

  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /admin — només ADMIN
  const isAdminOnly = adminOnlyRoutes.some((route) => pathname.startsWith(route));
  if (isAdminOnly && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/no-autoritzat", request.url));
  }

  // /editor — EDITOR o ADMIN
  const isEditor = editorRoutes.some((route) => pathname.startsWith(route));
  if (isEditor && token?.role !== "EDITOR" && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/no-autoritzat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/editor/:path*",
    "/dashboard/:path*",
    "/perfil/:path*",
    "/perfil",
  ],
};
