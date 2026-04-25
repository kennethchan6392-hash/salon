"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function useWindowHash() {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const sync = () => {
      if (typeof window === "undefined") {
        return;
      }
      setHash(window.location.hash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  return hash;
}

type LinkProps = {
  href: string;
  className: string;
  classNameActive: string;
  children: React.ReactNode;
};

function HashOrLocaleLink(p: LinkProps) {
  const hash = useWindowHash();
  const pathname = usePathname();
  if (p.href.startsWith("#")) {
    const active = hash === p.href;
    return (
      <a
        href={p.href}
        className={active ? p.classNameActive : p.className}
      >
        {p.children}
      </a>
    );
  }
  const isHome = pathname === p.href;
  const homeActive = isHome && (hash === "" || hash === "#");
  return (
    <Link
      href={p.href}
      className={homeActive ? p.classNameActive : p.className}
    >
      {p.children}
    </Link>
  );
}

type Nav = {
  locale: string;
  home: string;
  priceList: string;
  contact: string;
  shop: string;
  baseClass: string;
  activeClass: string;
};

/**
 * W52-style nav: uppercase, underline for section matching current URL hash.
 */
export function SalonHeaderPrimaryNav(t: Nav) {
  const homePath = `/${t.locale}`;

  return (
    <nav
      className="hidden items-center gap-0.5 text-xs font-semibold uppercase tracking-wider text-zinc-900 md:flex"
      aria-label="Primary"
    >
      <HashOrLocaleLink
        href={homePath}
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.home}
      </HashOrLocaleLink>
      <HashOrLocaleLink
        href="#price-list"
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.priceList}
      </HashOrLocaleLink>
      <HashOrLocaleLink
        href="#contact"
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.contact}
      </HashOrLocaleLink>
      <HashOrLocaleLink
        href="#shop"
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.shop}
      </HashOrLocaleLink>
    </nav>
  );
}

export function SalonHeaderMobileNav(t: Nav & { rowClassName: string }) {
  const homePath = `/${t.locale}`;
  return (
    <div className={t.rowClassName}>
      <HashOrLocaleLink
        href={homePath}
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.home}
      </HashOrLocaleLink>
      <HashOrLocaleLink
        href="#price-list"
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.priceList}
      </HashOrLocaleLink>
      <HashOrLocaleLink
        href="#contact"
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.contact}
      </HashOrLocaleLink>
      <HashOrLocaleLink
        href="#shop"
        className={t.baseClass}
        classNameActive={t.activeClass}
      >
        {t.shop}
      </HashOrLocaleLink>
    </div>
  );
}
