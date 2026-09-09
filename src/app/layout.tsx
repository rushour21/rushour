import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "react-day-picker/style.css";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Rushour",
  description: "Small steps. Bigger tomorrows.",
  icons: { icon: "/assets/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      {/* Browser extensions (Bitdefender's TrafficLight and similar) inject
          attributes like bis_skin_checked into the DOM before React hydrates,
          which trips a false-positive hydration mismatch warning that has
          nothing to do with app code. Suppressed at the one place it appears. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
