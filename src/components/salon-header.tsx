import Link from "next/link";

type Nav = {
  brandName: string;
  home: string;
  priceList: string;
  ourTeam: string;
  contact: string;
  shop: string;
  searchAria: string;
  cartAria: string;
  cartEmpty: string;
  locale: string;
  cartCount: number;
};

const iconSearch = (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

const iconCart = (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
    />
  </svg>
);

export function SalonHeader(t: Nav) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-3.5">
        <Link
          href={`/${t.locale}`}
          className="font-[family-name:var(--font-display)] text-lg tracking-tight text-zinc-900 sm:text-xl"
        >
          {t.brandName}
        </Link>
        <nav
          className="hidden items-center gap-1 text-sm font-medium text-zinc-700 md:flex"
          aria-label="Primary"
        >
          <Link href={`/${t.locale}`} className="rounded-md px-2.5 py-1.5 transition hover:bg-zinc-100">
            {t.home}
          </Link>
          <a href="#price-list" className="rounded-md px-2.5 py-1.5 transition hover:bg-zinc-100">
            {t.priceList}
          </a>
          <a href="#team" className="rounded-md px-2.5 py-1.5 transition hover:bg-zinc-100">
            {t.ourTeam}
          </a>
          <a href="#contact" className="rounded-md px-2.5 py-1.5 transition hover:bg-zinc-100">
            {t.contact}
          </a>
          <a href="#shop" className="rounded-md px-2.5 py-1.5 transition hover:bg-zinc-100">
            {t.shop}
          </a>
        </nav>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <a
            href="#shop"
            className="rounded-full p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            title={t.searchAria}
            aria-label={t.searchAria}
          >
            {iconSearch}
          </a>
          <a
            href="#shop"
            className="group relative inline-flex items-center justify-center rounded-full p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
            title={t.cartEmpty}
            aria-label={t.cartAria}
          >
            {iconCart}
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-800 px-0.5 text-[10px] font-semibold text-white">
              {t.cartCount}
            </span>
            <span className="sr-only">{t.cartEmpty}</span>
          </a>
          <span className="ml-0.5 hidden h-5 w-px self-center bg-zinc-200 sm:block" />
          <div className="ml-0 flex gap-0.5 text-sm sm:ml-1">
            {t.locale === "en" ? (
              <span className="rounded-md bg-zinc-100 px-2 py-1 font-medium text-zinc-900">EN</span>
            ) : (
              <Link
                className="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                href="/en"
              >
                EN
              </Link>
            )}
            {t.locale === "zh-HK" ? (
              <span className="rounded-md bg-zinc-100 px-2 py-1 font-medium text-zinc-900">繁</span>
            ) : (
              <Link
                className="rounded-md px-2 py-1 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                href="/zh-HK"
              >
                繁
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-100 bg-zinc-50/80 px-4 py-1.5 md:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs font-medium text-zinc-600">
          <Link href={`/${t.locale}`} className="text-zinc-800">
            {t.home}
          </Link>
          <a href="#price-list">{t.priceList}</a>
          <a href="#team">{t.ourTeam}</a>
          <a href="#contact">{t.contact}</a>
          <a href="#shop">{t.shop}</a>
        </div>
      </div>
    </header>
  );
}
