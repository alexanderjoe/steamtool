import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Steam Library Compare",
  description: "Compare friends steam libraries with their steam IDs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-steam-darkest text-white`}
      >
        <div className="relative min-h-screen overflow-x-hidden">
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(102,192,244,0.12),transparent)]" />
            <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-steam-blue/10 blur-[120px]" />
            <div className="absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
            <div className="absolute inset-0 bg-steam-dark/40" />
          </div>
          <Nav />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
