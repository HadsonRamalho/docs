import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["pt-br", "en"],
  defaultLocale: "pt-br",
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
