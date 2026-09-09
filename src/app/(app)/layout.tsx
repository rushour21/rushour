import { AppShell } from "@/components/app/shell";

/**
 * Every signed-in screen renders inside the rail and top bar. Frontend stage:
 * the name is fixed here rather than read from the session, so the screens can
 * be designed without an auth round trip on every navigation.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell name="Rushabh Ingle" unread={2}>
      {children}
    </AppShell>
  );
}
