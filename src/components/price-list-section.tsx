import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { getPriceListData } from "@/data/price-list";
import type { PriceSimpleSection, PriceTieredSection } from "@/data/price-list";

type Props = {
  locale: Locale;
  displayClassName: string;
  sansClassName: string;
  priceListTitle: string;
  intro: string;
  disclaimer: string;
};

function TieredBlock({
  s,
  sansClassName,
  isFirstSection,
}: {
  s: PriceTieredSection;
  sansClassName: string;
  isFirstSection: boolean;
}) {
  return (
    <div className={isFirstSection ? "" : "mt-16"}>
      <h3
        className={`${sansClassName} text-left text-sm font-semibold uppercase tracking-[0.2em] text-white`}
      >
        {s.title}
      </h3>
      {s.subsections.map((sub, i) => (
        <div key={sub.name} className={i === 0 ? "mt-6" : "mt-10"}>
          <p
            className={`${sansClassName} text-center text-xs font-medium uppercase tracking-wider text-zinc-300`}
          >
            {sub.name}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table
              className={`${sansClassName} w-full min-w-[720px] border-collapse text-xs text-white sm:min-w-[800px] sm:text-sm`}
            >
              <thead>
                <tr>
                  {sub.columnHeaders.map((h, j) => (
                    <th
                      key={`${sub.name}-h-${j}`}
                      className="border border-white/80 px-2 py-2.5 font-medium text-zinc-100"
                      style={j === 0 ? { width: "28%" } : { width: "14.4%" }}
                    >
                      {h || " "}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sub.rows.map((row) => (
                  <tr key={row.service}>
                    <td className="border border-white/80 px-2 py-2.5 text-left text-zinc-100">
                      {row.service}
                    </td>
                    {row.prices.map((p, j) => (
                      <td
                        key={`${row.service}-p-${j}`}
                        className="border border-white/80 px-1 py-2.5 text-center tabular-nums text-zinc-100"
                      >
                        {p}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function SimpleBlock({
  s,
  sansClassName,
  isFirstSection,
}: {
  s: PriceSimpleSection;
  sansClassName: string;
  isFirstSection: boolean;
}) {
  return (
    <div className={isFirstSection ? "" : "mt-16"}>
      <h3
        className={`${sansClassName} text-left text-sm font-semibold uppercase tracking-[0.2em] text-white`}
      >
        {s.title}
      </h3>
      {s.note ? (
        <p className={`${sansClassName} mt-1 text-sm text-zinc-400`}>{s.note}</p>
      ) : null}
      <div className="mt-4 overflow-x-auto">
        <table
          className={`${sansClassName} w-full min-w-[320px] max-w-2xl border-collapse text-sm text-white`}
        >
          <tbody>
            {s.rows.map((row) => (
              <tr key={row.name}>
                <td className="border border-white/80 px-3 py-2.5 text-left text-zinc-100">
                  {row.name}
                </td>
                <td className="w-32 border border-white/80 px-3 py-2.5 text-right tabular-nums text-zinc-100 sm:w-40">
                  {row.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderAll(data: ReturnType<typeof getPriceListData>, sansClassName: string): ReactNode {
  return data.sections.map((s, i) => {
    const isFirst = i === 0;
    if (s.kind === "tiered") {
      return (
        <TieredBlock
          key={s.id}
          s={s}
          sansClassName={sansClassName}
          isFirstSection={isFirst}
        />
      );
    }
    return (
      <SimpleBlock
        key={s.id}
        s={s}
        sansClassName={sansClassName}
        isFirstSection={isFirst}
      />
    );
  });
}

export function PriceListSection(p: Props) {
  const data = getPriceListData(p.locale);
  return (
    <section
      id="price-list"
      className="border-b border-white/10 bg-black text-white"
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
        <div className="mt-10">{renderAll(data, p.sansClassName)}</div>
      </div>
    </section>
  );
}
