/**
 * Prefix for files served from `public/` when the app uses `basePath` (GitHub Pages `/salon`).
 * Set `NEXT_PUBLIC_BASE_PATH=/salon` on static export builds; omit for local `next dev`.
 */
export function publicAssetPath(path: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
