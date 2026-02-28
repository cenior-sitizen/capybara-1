import type { Metadata } from "next";
import { DM_Sans, Fahkwang } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

const fahkwang = Fahkwang({
  subsets: ["latin", "thai"],
  variable: "--font-fahkwang",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VeriSG – Check information credibility",
  description: "AI-assisted credibility assessment for Singapore and multilingual communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fahkwang.variable}`}>
      <body className="min-h-screen antialiased font-sans bg-[#0d0d12] text-white">
        {children}
      </body>
    </html>
  );
}
