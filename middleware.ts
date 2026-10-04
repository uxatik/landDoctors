import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { oldHostRedirect } from "./lib/canonical-host";
import { refreshStaffSession } from "./lib/supabase/middleware";

const intl = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // The old vercel.app address goes to the same page on the current address.
  const moved = oldHostRedirect(request.headers.get("host"), request.nextUrl.pathname + request.nextUrl.search, process.env.NEXT_PUBLIC_SITE_URL);
  if (moved) return NextResponse.redirect(moved, 308);

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const response = await refreshStaffSession(request);
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  return intl(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
