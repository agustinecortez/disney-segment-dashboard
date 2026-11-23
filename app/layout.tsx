import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Disney Segment Forecast Dashboard — Omico Group",
  description:
    "Driver-based segment forecast model for The Walt Disney Company (DIS). " +
    "Compares the final FY26 forecast with FY25 and FY26 actuals, and lets you adjust twelve " +
    "operational drivers to model FY26 revenue, operating income, and net income across " +
    "Entertainment, Sports, and Experiences segments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
