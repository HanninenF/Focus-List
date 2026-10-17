import type { Metadata } from "next";
import "./globals.css";
import "../src/features/focus/components/FocusWorkspace.scss";
import "../src/features/focus/components/FocusHeader.scss";
import "../src/features/focus/components/Sidebar.scss";
import "../src/features/focus/components/ProgressSummary.scss";
import "../src/features/todos/components/ThreadList.scss";
import "../src/features/todos/components/ThreadDetail.scss";
import "../src/features/todos/components/NewItemForm.scss";
import "../src/features/markdown/components/MarkdownText.scss";
import "../src/features/ai-formatting/components/AiFormatButton.scss";
import "../src/features/links/components/LinksDialog.scss";
import "../src/shared/ui/Tip.scss";

export const metadata: Metadata = {
  title: "Lugn lista",
  description: "Todo-trådar med underinlägg och tydlig progress.",
  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
