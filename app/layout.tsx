import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lugn lista",
  description: "Todo-trådar med underinlägg och tydlig progress.",
  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="sv"><body>{children}</body></html>;
}
