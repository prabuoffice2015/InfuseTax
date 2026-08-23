import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1E40AF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "InfuseTax - Modern Tax Compliance, GST, ITR & E-Governance Platform",
  description: "AI-Powered B2B FinTech, GST Registration, GSTR-1/3B Filing, Income Tax Returns, PAN, Passport and Dynamic Certificate Platform.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InfuseTax POS",
  },
  icons: {
    icon: "/brand/favicon.ico",
    shortcut: "/brand/favicon_32x32.png",
    apple: "/brand/infusetax_icon_180.png",
  },
  openGraph: {
    title: "InfuseTax - AI-Powered Tax & E-Governance Platform",
    description: "Multi-tenant B2B tax compliance, e-filing, and digital document desks.",
    images: ["/brand/infusetax_og_1200x630.png"],
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
