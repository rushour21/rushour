import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Guards the signed-in surface. Uses the edge-safe config only - the
 * credentials provider lives in `auth.ts` and never runs here.
 */
export const { auth: proxy } = NextAuth(authConfig);

export default proxy;

export const config = {
  matcher: ["/home/:path*", "/today/:path*", "/goals/:path*", "/review/:path*", "/onboarding/:path*"],
};
