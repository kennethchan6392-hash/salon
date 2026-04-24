/**
 * `tel:` href for the salon. Avoids a double country code when the string already
 * includes 853 (Macau) or 852 (Hong Kong).
 */
export function buildTelHref(phone: string): string {
  const d = phone.replaceAll(/\D/g, "");
  if (d.length === 0) return "tel:";
  if (d.startsWith("852") || d.startsWith("853")) {
    return `tel:+${d}`;
  }
  return `tel:+853${d.replace(/^0+/, "")}`;
}

/** E.164 for schema.org and meta when the display value may already include 853/852. */
export function phoneToE164(phone: string): string {
  const d = phone.replaceAll(/\D/g, "");
  if (d.length === 0) return phone.trim();
  if (d.startsWith("852") || d.startsWith("853")) {
    return `+${d}`;
  }
  return `+853${d.replace(/^0+/, "")}`;
}
