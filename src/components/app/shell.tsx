"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({
  children,
  name,
  unread = 0,
}: {
  children: React.ReactNode;
  name: string;
  unread?: number;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-dvh flex">
      {/* Desktop rail */}
      <aside className="hidden lg:block w-[248px] shrink-0 h-dvh sticky top-0">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {navOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-[264px] h-dvh">
            <Sidebar onNavigate={() => setNavOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar name={name} unread={unread} onOpenNav={() => setNavOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 pb-10">{children}</main>
      </div>
    </div>
  );
}
