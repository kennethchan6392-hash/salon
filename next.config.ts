import type { NextConfig } from "next";

/** Set STATIC_EXPORT=1 for GitHub Pages (static files only, no /api, no Prisma/SSR on the host). */
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isStaticExport && {
    output: "export" as const,
    basePath: "/salon",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  ...(!isStaticExport && {
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
