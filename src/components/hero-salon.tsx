import Image from "next/image";

type Props = {
  brandTitle: string;
  brandSubtitle: string;
  kw1: string;
  kw2: string;
  kw3: string;
  bookNow: string;
  shopNow: string;
  displayClassName: string;
  sansClassName: string;
};

/** Self-hosted hero (was Unsplash) — LCP-friendly with `next/image` + `priority`. */
const HERO_SRC = "/hero/salon-hero.jpg";

export function HeroSalon(p: Props) {
  return (
    <section className="relative isolate min-h-[min(72vh,720px)] w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Bypass `/_next/image`: Safari on localhost often skips painting optimized hero URLs; `/hero/…` from `public/` is direct. */}
        <Image
          src={HERO_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          unoptimized
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(24, 24, 27, 0.88) 0%, rgba(24, 24, 27, 0.5) 45%, rgba(24, 24, 27, 0.78) 100%)",
          }}
          aria-hidden
        />
      </div>
      <div className="mx-auto flex min-h-[min(72vh,720px)] max-w-6xl flex-col justify-center gap-6 px-4 py-20 sm:px-6 sm:py-24">
        <p
          className={`${p.displayClassName} text-3xl font-semibold text-white sm:text-4xl md:text-5xl`}
        >
          {p.brandTitle}
        </p>
        <p className={`${p.sansClassName} max-w-2xl text-sm leading-relaxed text-zinc-200 sm:text-base`}>
          {p.brandSubtitle}
        </p>
        <div className="flex max-w-3xl flex-wrap gap-2.5 sm:gap-3">
          {[p.kw1, p.kw2, p.kw3].map((k, i) => (
            <span
              key={`${k}-${i}`}
              className={`${p.sansClassName} rounded-full border border-white/30 bg-gradient-to-r from-black/50 via-black/40 to-black/50 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm ${
                i === 2 ? "border-white/40 bg-gradient-to-r from-white/5 via-white/10 to-white/5" : ""
              }`}
            >
              {k}
            </span>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          <a
            href="#booking"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
          >
            {p.bookNow}
          </a>
          <a
            href="#shop"
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/50 hover:bg-white/10"
          >
            {p.shopNow}
          </a>
        </div>
      </div>
    </section>
  );
}
