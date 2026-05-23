import type { Metadata } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

const bodyFont = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Golden Plaice Fish & Chips | Salisbury Takeaway",
    template: "%s | Golden Plaice",
  },
  description:
    "Order fish & chips, burgers, pies and more online from Golden Plaice in Longhedge, Salisbury. Collection or delivery available.",
  keywords: ["fish and chips", "takeaway", "Salisbury", "Longhedge", "delivery"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="font-body">
        <Header />
        <main className="min-h-[calc(100vh-12rem)]">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
