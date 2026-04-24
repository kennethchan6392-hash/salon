type Props = {
  address: string;
  email: string;
  phone: string;
  hoursLine: string;
};

export function SalonTopBar({ address, email, phone, hoursLine }: Props) {
  const tel = phone.replaceAll(/\D/g, "");
  return (
    <div className="border-b border-zinc-200/60 bg-zinc-900 text-[11px] text-zinc-200 sm:text-xs">
      <div className="mx-auto max-w-6xl px-4 py-1.5 sm:px-6 sm:py-2">
        <div className="flex flex-col items-start justify-between gap-1.5 sm:flex-row sm:items-center sm:gap-4">
          <p className="line-clamp-2 font-sans sm:line-clamp-1 sm:shrink-0" title={address}>
            {address}
          </p>
          <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 sm:w-auto sm:justify-end sm:gap-x-5">
            <a
              href={`mailto:${email}`}
              className="shrink-0 text-zinc-200 underline-offset-2 transition hover:text-white hover:underline"
            >
              {email}
            </a>
            <a
              href={tel ? `tel:+853${tel}` : `tel:${phone}`}
              className="shrink-0 text-zinc-200 underline-offset-2 transition hover:text-white hover:underline"
            >
              {phone}
            </a>
            <span
              className="hidden w-full text-zinc-300 sm:inline sm:w-auto"
              title={hoursLine}
            >
              {hoursLine}
            </span>
          </div>
        </div>
        <p className="mt-0.5 text-zinc-400 sm:hidden">{hoursLine}</p>
      </div>
    </div>
  );
}
