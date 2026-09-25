import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.maison-zdr.online").replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/events", "/news", "/gallery", "/contact"],
      disallow: [
        "/admin/",
        "/profile",
        "/my-registrations",
        "/verify-email",
        "/forgot-password",
        "/reset-password",
        "/login",
        "/signup",
        "/events/*/register",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
