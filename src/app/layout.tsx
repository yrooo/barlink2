import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import WhatsAppVerificationWrapper from "@/components/WhatsAppVerificationWrapper";
import { LoadingProvider } from "@/components/LoadingProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barlink",
  description: "Platform pencarian kerja dan kandidat terbaik",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <LoadingProvider>
            <div className="flex flex-col min-h-screen">
              {children}
            </div>
            <WhatsAppVerificationWrapper />
            <Toaster position="top-right" richColors />
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

