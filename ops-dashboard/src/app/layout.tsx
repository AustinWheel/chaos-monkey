import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ops Dashboard",
  description: "Production Engineering Operations Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="h-full min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
