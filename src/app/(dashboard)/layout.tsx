import AppShell from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/providers/theme-provider";
import PageTransition from "@/components/shared/animations/PageTransition";
import { FeedbackWidget } from "@/components/shared/feedback-widget";
import { formatNairaFromKobo } from "@/lib/format-naira";

export default async function AppScopedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let formattedBalance: string = "₦0.00";

  try {
    const res = await fetch("/api/v1/finance/balance", {
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const json = await res.json();
      const kobo = json.data?.balance ?? json.balance ?? 0;
      formattedBalance = formatNairaFromKobo(kobo);
    }
  } catch (error) {
    console.error("Failed to fetch organization balance:", error);
    // default remains ₦0.00
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AppShell balance={formattedBalance}>
        <PageTransition>{children}</PageTransition>
      </AppShell>
      <FeedbackWidget />
    </ThemeProvider>
  );
}
