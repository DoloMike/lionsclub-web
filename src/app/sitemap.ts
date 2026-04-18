import type { MetadataRoute } from "next";

const paths = [
  "",
  "/about",
  "/service",
  "/events",
  "/fundraising",
  "/membership",
  "/login",
  "/contact",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  const now = new Date();

  return paths.map((path, i) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : Math.max(0.5, 0.9 - i * 0.05),
  }));
}
