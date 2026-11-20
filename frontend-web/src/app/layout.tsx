import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://taxpartner.in"),
  title: "TaxPartner - AI-Powered Tax Compliance, GST & Income Tax Platform",
  description: "AI-Powered B2B FinTech Platform for GST Registration, Income Tax (IT) Return Filing, and GSTR-1/3B Compliance.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TaxPartner POS",
  },
  icons: {
    icon: "/brand/favicon.ico",
    shortcut: "/brand/favicon_32x32.png",
    apple: "/brand/taxpartner_icon_180.png",
  },
  openGraph: {
    title: "TaxPartner - AI-Powered Tax Compliance Platform",
    description: "Multi-tenant B2B tax compliance for GST Registration, ITR Filing, and GSTR-1/3B Returns.",
    images: ["/brand/taxpartner_og_1200x630.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
