import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "I4C CryptoTrace - Cyber Crime Command Center",
  description: "Sub-second cross-chain multi-hop tracing and statutory asset freeze under Section 91/102 CrPC (MHA/I4C PS26183)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#111318] text-[#e2e2e8] antialiased overflow-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
