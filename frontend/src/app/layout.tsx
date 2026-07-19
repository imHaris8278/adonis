import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { SiteShell } from "@/components/SiteShell";
import "./globals.css";

const body = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

const display = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Adonis — Manga & Novels",
  description: "Read and publish manga and novels.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} h-full`}>
      <body className="min-h-full bg-black text-white antialiased">
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
      </body>
    </html>
  );
}
