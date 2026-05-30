
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
