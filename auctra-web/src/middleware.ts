import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const protectedRoutes = [
    "/dashboard",
    "/leaderboard",
    "/profile",
    "/auction",
    "/settings",
    "/seller",
    "/explore" // if explore should be protected
  ];

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  const privyToken = req.cookies.get("privy-token");

  // If the route is protected and the user lacks the privy token cookie, redirect to home
  // Note: For hackathon, we rely on ProtectedRoute.tsx client-side guard as Privy may not set the cookie without specific config.
  // if (isProtected && !privyToken) {
  //   return NextResponse.redirect(new URL("/", req.url));
  // }

  return NextResponse.next();
}

export const config = {
  // Avoid running middleware on static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
