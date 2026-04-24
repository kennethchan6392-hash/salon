type FooterProps = {
  displayClassName: string;
  sansClassName: string;
  tagline: string;
  addressLabel: string;
  phoneLabel: string;
  emailLabel: string;
  whatsappLabel: string;
  address: string;
  phone: string;
  email: string;
  hoursTitle: string;
  hoursDetail: string;
  whatsappUrl: string | null;
  waDisplay: string;
  navTitle: string;
};

export function SiteFooter(p: FooterProps) {
  const tel = p.phone.replaceAll(/\D/g, "");
  const hasWhatsapp = Boolean(p.whatsappUrl);
  return (
    <footer
      id="contact"
      className="border-t border-zinc-200/80 bg-zinc-100/90 text-zinc-800"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p
          className={`${p.displayClassName} text-center text-xl leading-relaxed text-zinc-800 sm:text-2xl max-w-3xl mx-auto`}
        >
          {p.tagline}
        </p>
        <div
          className={`${p.sansClassName} mt-10 grid gap-8 border-t border-zinc-200/80 pt-10 sm:grid-cols-2 md:grid-cols-3`}
        >
          <div>
            <h3 className="text-sm font-semibold text-zinc-500">{p.navTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-800">{p.address}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-500">{p.emailLabel}</h3>
            <a
              className="mt-2 block text-sm text-zinc-800 underline decoration-zinc-300 underline-offset-2 transition hover:decoration-zinc-500"
              href={`mailto:${p.email}`}
            >
              {p.email}
            </a>
            <h3 className="mt-4 text-sm font-semibold text-zinc-500">{p.phoneLabel}</h3>
            <a
              className="mt-1 block text-sm text-zinc-800 underline decoration-zinc-300 underline-offset-2 transition hover:decoration-zinc-500"
              href={tel ? `tel:+853${tel}` : `tel:${p.phone}`}
            >
              {p.phone}
            </a>
            {hasWhatsapp && p.whatsappUrl ? (
              <a
                className="mt-2 block text-sm text-amber-900 underline decoration-amber-300 underline-offset-2 transition hover:decoration-amber-500"
                href={p.whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                {p.whatsappLabel}: {p.waDisplay}
              </a>
            ) : null}
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold text-zinc-500">{p.hoursTitle}</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-800 whitespace-pre-line">
              {p.hoursDetail.split("\n").map((line, i) => (
                <li key={`${i}-${line}`}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
