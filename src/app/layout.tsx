import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HL Taxes | Crypto PnL & Tax Dashboard",
  description:
    "Upload a crypto trade export CSV to calculate realized profit, fees, and estimated short vs. long-term taxes in a beautiful dark dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
