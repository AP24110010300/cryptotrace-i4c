import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CryptoTrace-I4C — Law Enforcement Portal (Clean State)",
  description: "India-first operational bridge between NCRP cybercrime cases, multi-chain blockchain tracing, FIU-IND VASP intelligence, explainable risk analysis, and automated statutory freezing workflows. MHA/I4C PS26183.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#051424]" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[#051424] text-[#e2e8f0] antialiased overflow-hidden selection:bg-blue-600 selection:text-white font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
