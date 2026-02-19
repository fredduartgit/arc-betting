import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arcbetting.xyz"),
  title: "ARC Betting | Future of Prediction",
  description: "Experience decentralized price prediction markets on the ARC Testnet. Bet on crypto assets with zero custodial risk.",
  keywords: ["crypto", "betting", "prediction market", "ARC testnet", "decentralized", "web3"],
  authors: [{ name: "ARC Protocol" }],
  creator: "ARC Protocol",
  icons: {
    icon: '/icon', // Will point to our dynamic icon
  },
  openGraph: {
    title: "ARC Betting | Win on Testnet",
    description: "Start predicting market movements today. Instant payouts, transparent smart contracts.",
    siteName: "ARC Betting",
    url: "https://arcbetting.xyz",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARC Betting",
    description: "Decentralized Prediction Markets on ARC.",
    creator: "@ARCTestnet", // Placeholder
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#06b6d4" // Cyan-500
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
