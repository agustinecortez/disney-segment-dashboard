import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Disney Segment Forecast Dashboard — Omico Group",
  description:
    "Driver-based segment forecast model for The Walt Disney Company (DIS). " +
    "Old Method: the final FY26 forecast against FY25 and FY26 actuals. New Method: Disney's " +
    "new segment structure, with twelve adjustable drivers projecting FY27 and FY28 revenue, " +
    "operating income, and net income for Entertainment, Sports, and Experiences against " +
    "Disney's FY27 guidance.",
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
