import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isProtectedRouteMatcher = createRouteMatcher(["/battles(.*)", "/profile(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();
  const isProtectedRoute = isProtectedRouteMatcher(request);
  console.log({
    isAuthenticated,
    isProtectedRoute,
  });
  if (isProtectedRoute && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/home");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
