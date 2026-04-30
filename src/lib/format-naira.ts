/**
 * Formats a balance from kobo (smallest unit) to Naira (NGN) currency string.
 *
 * @param kobo - The amount in kobo (bigint or number). Defaults to 0 if null/undefined.
 * @returns Formatted currency string, e.g. "₦1,234.56"
 */
export function formatNairaFromKobo(
  kobo: bigint | number | null | undefined,
): string {
  const amountInKobo = kobo ? Number(kobo) : 0;
  const amountInNaira = amountInKobo / 100;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInNaira);
}
