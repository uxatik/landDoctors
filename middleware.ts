import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Public site only. Staff area and API routes handle their own requests.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
