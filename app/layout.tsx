import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Imisozi Homes, houses and apartments in Kigali", template: "%s | Imisozi Homes" },
  description: "Houses, apartments and plots to rent or buy across Kigali, with real photos, prices in RWF or USD and viewings you can book online.",
};
export const viewport: Viewport = { themeColor: "#1c2b2d" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
