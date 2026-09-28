import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelPilot — Turn media into business momentum",
  description: "AI-powered business media intelligence and growth copilot.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
