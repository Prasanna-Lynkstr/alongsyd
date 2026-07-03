import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Alongsyd — For every step, and the ones after",
    template: "%s · Alongsyd",
  },
  description:
    "A companion for the whole special-needs parenting journey. Ask a real question, get a trustworthy answer from parents who solved the same thing — and check what your child is entitled to.",
  manifest: "/manifest.webmanifest",
  applicationName: "Alongsyd",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Alongsyd",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2c6f78",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
