import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/zh-HK`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/en`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/zh-HK/products`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/en/products`, lastModified, changeFrequency: "weekly", priority: 0.85 },
  ];
}
