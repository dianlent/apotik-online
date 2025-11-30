import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { SettingsProvider } from "@/context/SettingsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apotik POS - Your Trusted Online Pharmacy",
  description: "Point of Sale System for Pharmacy - Fast, Reliable, and Secure Healthcare Services",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
        suppressHydrationWarning
      >
        <SettingsProvider>
          <CartProvider>
            <ToastProvider>
              <div className="flex flex-col min-h-screen">
                <ConditionalNavbar />
                <main className="flex-1">
                  {children}
                </main>
                <ConditionalFooter />
              </div>
            </ToastProvider>
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
