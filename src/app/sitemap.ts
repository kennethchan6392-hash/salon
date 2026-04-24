import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/zh-HK`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/en`, lastModified, changeFrequency: "weekly", priority: 0.9 },
  ];
}
