import AppShell from "../components/layout/AppShell";

export default function AccountInsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
