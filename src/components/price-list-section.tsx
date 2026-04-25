import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { getPriceListData } from "@/data/price-list";
import type {
  PriceCompareSection,
  PriceDyeCutSection,
  PriceEventsSection,
  PriceIntroListSection,
  PriceListSection,
  PriceMembershipSection,
  PriceNanoSection,
} from "@/data/price-list";

type Props = {
  locale: Locale;
  displayClassName: string;
  sansClassName: string;
  priceListTitle: string;
  intro: string;
  disclaimer: string;
};

const panel =
  "rounded-2xl border border-white/10 bg-zinc-900/40 p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.85)] backdrop-blur-sm sm:p-8";

function SectionTitle({
  children,
  sansClassName,
}: {
  children: ReactNode;
  sansClassName: string;
}) {
  return (
    <h3
      className={`${sansClassName} border-l-2 border-amber-400/90 pl-3 text-sm font-semibold uppercase tracking-[0.18em] text-white`}
    >
      {children}
    </h3>
  );
}

function IntroListBlock({
  s,
  sansClassName,
}: {
  s: PriceIntroListSection;
  sansClassName: string;
}) {
  return (
    <div className={panel}>
      <SectionTitle sansClassName={sansClassName}>{s.title}</SectionTitle>
      {s.note ? (
        <p className={`${sansClassName} mt-3 text-sm text-zinc-400`}>{s.note}</p>
      ) : null}
      <ul className={`${sansClassName} mt-6 divide-y divide-white/10 text-sm`}>
        {s.rows.map((row) => (
          <li key={row.name} className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <span className="text-zinc-100">
              {row.name}
              {row.detail ? (
                <span className="mt-0.5 block text-xs font-normal text-zinc-500 sm:mt-0 sm:inline sm:pl-2">
                  {row.detail}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 tabular-nums text-amber-200/95 sm:text-right">{row.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompareTableBlock({
  s,
  sansClassName,
}: {
  s: PriceCompareSection;
  sansClassName: string;
}) {
  return (
    <div className={panel}>
      <SectionTitle sansClassName={sansClassName}>{s.title}</SectionTitle>
      {s.note ? (
        <p className={`${sansClassName} mt-3 text-sm text-zinc-400`}>{s.note}</p>
      ) : null}
      <div className="mt-5 overflow-x-auto rounded-lg border border-white/10">
        <table
          className={`${sansClassName} w-full min-w-[520px] border-collapse text-left text-sm text-zinc-100`}
        >
          <thead>
            <tr className="border-b border-white/15 bg-zinc-950/80">
              <th className="px-3 py-3 font-semibold text-zinc-200 sm:px-4">{""}</th>
              <th className="px-3 py-3 font-semibold text-amber-200/90 sm:px-4">{s.colMember}</th>
              <th className="px-3 py-3 font-semibold text-zinc-300 sm:px-4">{s.colGuest}</th>
            </tr>
          </thead>
          <tbody>
            {s.rows.map((row) => (
              <tr key={row.service} className="border-b border-white/10 last:border-0">
                <td className="px-3 py-3 align-top text-zinc-100 sm:px-4 sm:py-3.5">{row.service}</td>
                <td className="px-3 py-3 align-top tabular-nums text-amber-100/95 sm:px-4">{row.member}</td>
                <td className="px-3 py-3 align-top tabular-nums text-zinc-300 sm:px-4">{row.guest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MembershipBlock({
  s,
  sansClassName,
}: {
  s: PriceMembershipSection;
  sansClassName: string;
}) {
  return (
    <div className={panel}>
      <SectionTitle sansClassName={sansClassName}>{s.title}</SectionTitle>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {s.groups.map((g) => (
          <div
            key={g.heading}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-4"
          >
            <p className={`${sansClassName} text-xs font-semibold uppercase tracking-wider text-amber-200/85`}>
              {g.heading}
            </p>
            <ul className={`${sansClassName} mt-3 space-y-2 text-sm text-zinc-200`}>
              {g.lines.map((line) => (
                <li key={line} className="tabular-nums">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {s.footnotes.length > 0 ? (
        <ul className={`${sansClassName} mt-6 space-y-2 border-t border-white/10 pt-5 text-xs leading-relaxed text-zinc-500`}>
          {s.footnotes.map((f) => (
            <li key={f}>· {f}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function NanoBlock({ s, sansClassName }: { s: PriceNanoSection; sansClassName: string }) {
  return (
    <div className={`${panel} ring-1 ring-amber-900/30`}>
      <SectionTitle sansClassName={sansClassName}>{s.title}</SectionTitle>
      <p className={`${sansClassName} mt-4 text-sm leading-relaxed text-zinc-300`}>{s.lead}</p>
      <ul className="mt-6 space-y-2">
        {s.bullets.map((b, i) => (
          <li
            key={i}
            className={`${sansClassName} rounded-lg px-3 py-2.5 text-sm leading-relaxed sm:px-4 ${
              i % 2 === 0
                ? "bg-rose-950/35 text-rose-50/95"
                : "bg-sky-950/35 text-sky-50/95"
            }`}
          >
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {s.priceBlocks.map((block) => (
          <div key={block.subtitle} className="rounded-xl border border-white/10 bg-black/25 p-4">
            <p className={`${sansClassName} text-xs font-semibold uppercase tracking-wider text-zinc-400`}>
              {block.subtitle}
            </p>
            <ul className={`${sansClassName} mt-3 space-y-2 text-sm`}>
              {block.rows.map((r) => (
                <li key={r.label} className="flex justify-between gap-3 border-b border-white/5 py-2 last:border-0">
                  <span className="text-zinc-200">{r.label}</span>
                  <span className="shrink-0 tabular-nums text-amber-200/90">{r.value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {s.courseCards.map((c) => (
          <div
            key={c.label}
            className="min-w-[10rem] flex-1 rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-3"
          >
            <p className={`${sansClassName} text-xs text-amber-200/80`}>{c.label}</p>
            <p className={`${sansClassName} mt-1 text-lg font-semibold tabular-nums text-white`}>{c.value}</p>
          </div>
        ))}
      </div>
      <p className={`${sansClassName} mt-6 text-sm font-medium text-emerald-300/90`}>{s.promoLine}</p>
      <p className={`${sansClassName} mt-2 text-sm text-zinc-400`}>{s.contactLine}</p>
    </div>
  );
}

function DyeCutBlock({ s, sansClassName }: { s: PriceDyeCutSection; sansClassName: string }) {
  return (
    <div className={panel}>
      <SectionTitle sansClassName={sansClassName}>{s.title}</SectionTitle>
      {s.note ? (
        <p className={`${sansClassName} mt-3 text-sm text-amber-200/80`}>{s.note}</p>
      ) : null}
      <div className="mt-6 space-y-10">
        {s.blocks.map((block) => (
          <div key={block.subtitle ?? "block"}>
            {block.subtitle ? (
              <p className={`${sansClassName} text-xs font-semibold uppercase tracking-wider text-zinc-400`}>
                {block.subtitle}
              </p>
            ) : null}
            <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
              <table
                className={`${sansClassName} w-full min-w-[480px] border-collapse text-left text-sm text-zinc-100`}
              >
                <thead>
                  <tr className="border-b border-white/15 bg-zinc-950/80">
                    <th className="px-3 py-2.5 sm:px-4">{""}</th>
                    <th className="px-3 py-2.5 text-amber-200/90 sm:px-4">{block.colMember}</th>
                    <th className="px-3 py-2.5 text-zinc-300 sm:px-4">{block.colGuest}</th>
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row) => (
                    <tr key={row.label} className="border-b border-white/10 last:border-0">
                      <td className="px-3 py-2.5 align-top sm:px-4 sm:py-3">{row.label}</td>
                      <td className="px-3 py-2.5 align-top tabular-nums text-amber-100/95 sm:px-4">{row.member}</td>
                      <td className="px-3 py-2.5 align-top tabular-nums text-zinc-300 sm:px-4">{row.guest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsBlock({ s, sansClassName }: { s: PriceEventsSection; sansClassName: string }) {
  return (
    <div className={panel}>
      <SectionTitle sansClassName={sansClassName}>{s.title}</SectionTitle>
      <ul className={`${sansClassName} mt-6 divide-y divide-white/10 text-sm`}>
        {s.rows.map((row) => (
          <li
            key={row.name}
            className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
          >
            <span className="text-zinc-100">{row.name}</span>
            <span className="shrink-0 tabular-nums text-amber-200/95 sm:text-right">{row.price}</span>
          </li>
        ))}
      </ul>
      {s.addon ? (
        <p className={`${sansClassName} mt-4 border-t border-white/10 pt-4 text-sm text-zinc-400`}>{s.addon}</p>
      ) : null}
    </div>
  );
}

function renderSection(s: PriceListSection, sansClassName: string): ReactNode {
  switch (s.kind) {
    case "intro-list":
      return <IntroListBlock key={s.id} s={s} sansClassName={sansClassName} />;
    case "compare-table":
      return <CompareTableBlock key={s.id} s={s} sansClassName={sansClassName} />;
    case "membership":
      return <MembershipBlock key={s.id} s={s} sansClassName={sansClassName} />;
    case "nano":
      return <NanoBlock key={s.id} s={s} sansClassName={sansClassName} />;
    case "dye-cut":
      return <DyeCutBlock key={s.id} s={s} sansClassName={sansClassName} />;
    case "events":
      return <EventsBlock key={s.id} s={s} sansClassName={sansClassName} />;
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}

export function PriceListSection(p: Props) {
  const data = getPriceListData(p.locale);
  return (
    <section
      id="price-list"
      className="border-b border-white/10 bg-gradient-to-b from-black via-zinc-950 to-black text-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2
          className={`${p.displayClassName} text-3xl font-semibold text-white md:text-4xl`}
        >
          {p.priceListTitle}
        </h2>
        <p className={`${p.sansClassName} mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400`}>
          {p.intro}
        </p>
        <p className={`${p.sansClassName} mt-2 max-w-2xl text-xs leading-relaxed text-zinc-500`}>
          {p.disclaimer}
        </p>
        <div className="mt-12 flex flex-col gap-10 sm:gap-12">
          {data.sections.map((s) => renderSection(s, p.sansClassName))}
        </div>
      </div>
    </section>
  );
}
