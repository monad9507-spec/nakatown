import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NakaTown — Arc",
  description: "10,000 NakaTown collectibles on Arc.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
