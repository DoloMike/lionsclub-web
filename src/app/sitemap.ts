import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

const paths = [
  "",
  "/about",
  "/service",
  "/events",
  "/fundraising",
  "/fundraising/order",
  "/membership",
  "/login",
  "/contact",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicSiteUrl();

  const now = new Date();

  return paths.map((path, i) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : Math.max(0.5, 0.9 - i * 0.05),
  }));
}
