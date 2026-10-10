import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar, BottomNav } from "@/components/Nav";
import { RegisterSW } from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "K? — Kumusta Ka?",
  description: "A private, compassionate companion for tracking your mental wellness.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "K?",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7C5CFC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex safe-top bg-bg-pale text-text-primary antialiased">
        <RegisterSW />
        <Sidebar />
        <main className="flex-1 min-h-screen pb-20 md:pb-8">
          <div className="max-w-3xl mx-auto px-4 py-6">{children}</div>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
