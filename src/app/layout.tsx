import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UEFA Champions League — Plataforma SaaS",
  description: "Partits, equips i classificació de la Champions League",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="cl-bg min-h-full flex flex-col antialiased">
        <SessionProviderWrapper>
          <Navbar />
          <main className="flex-1 relative">{children}</main>
          <footer className="text-center py-5 border-t border-blue-900/40" style={{ background: "#000f2a" }}>
            <span style={{ color: "#4a7acc", fontSize: "0.8rem" }}>
              ⭐ UEFA Champions League SaaS — Joel Cano · {new Date().getFullYear()}
            </span>
          </footer>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
