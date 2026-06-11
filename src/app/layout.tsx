import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="cl-bg min-h-full flex flex-col antialiased">
        <SessionProviderWrapper>
          <Navbar />
          <main className="flex-1 relative">{children}</main>
          <footer style={{
            textAlign: "center",
            padding: "1.25rem 1rem",
            borderTop: "1px solid rgba(30,58,138,0.4)",
            background: "#000f2a",
          }}>
            <span style={{ color: "#4a7acc", fontSize: "0.78rem" }}>
              ⭐ UEFA Champions League SaaS — Joel Cano · {new Date().getFullYear()}
            </span>
          </footer>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
