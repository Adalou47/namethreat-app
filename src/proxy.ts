import { clerkMiddleware, createRouteMatcher, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher([
  "/",
  "/signup(.*)",
  "/onboarding(.*)",
  "/sign-in(.*)",
  "/caught",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const path = req.nextUrl.pathname;

  if (isPublic(req)) {
    if (path === "/" && userId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (path.startsWith("/dashboard") && !userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Signed-in user hitting /dashboard: only use Clerk onboarding_complete, not organisation_id
  if (path.startsWith("/dashboard") && userId) {
    const user = await currentUser();
    const metadata = user?.publicMetadata as
      | { onboarding_complete?: boolean; signup_type?: string }
      | undefined;
    if (metadata?.onboarding_complete !== true) {
      const signupType = metadata?.signup_type;
      if (signupType === "company") {
        return NextResponse.redirect(new URL("/onboarding/company", req.url));
      }
      return NextResponse.redirect(new URL("/onboarding/msp", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
