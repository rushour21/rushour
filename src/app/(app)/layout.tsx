import { AppShell } from "@/components/app/shell";

/**
 * Every signed-in screen renders inside the rail and top bar. "Your Account"
 * is only the fallback shown before a real name is saved in Settings - the
 * topbar reads the actual profile store and prefers that once it's set,
 * rather than this layout asserting a specific person's identity.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell name="Your Account" unread={2}>
      {children}
    </AppShell>
  );
}
