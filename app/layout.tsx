import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Disney Segment Forecast Dashboard — AugieAI Execute",
  description:
    "Driver-based segment forecast model for The Walt Disney Company (DIS). " +
    "Adjust twelve operational drivers to project FY26–FY28 revenue, operating income, " +
    "and net income across Entertainment, Sports, and Experiences segments.",
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
