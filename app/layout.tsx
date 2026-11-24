import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DarkGradientBg } from "@/components/ui/elegant-dark-pattern";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Rabbit Hole 🐇 | Curiosity has no bottom",
  description:
    "An interactive AI-powered curiosity and knowledge discovery platform. Follow connections, uncover unexpected ideas, and explore interconnected concepts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-100">
        <DarkGradientBg className="min-h-screen flex flex-col justify-between">
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </DarkGradientBg>
      </body>
    </html>
  );
}
