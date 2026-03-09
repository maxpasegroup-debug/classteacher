import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import AppProviders from "@/components/providers/AppProviders";
import DesktopTopNav from "@/components/layout/DesktopTopNav";
import DesktopSidebar from "@/components/layout/DesktopSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Roots Education Hub",
  description: "AI-powered student growth ecosystem for schools, tuition centres, and colleges"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>
          <div className="min-h-screen bg-slate-50">
            <div className="mx-auto flex min-h-screen max-w-6xl">
              {/* Desktop / tablet sidebar */}
              <DesktopSidebar />

              <div className="flex min-h-screen flex-1 flex-col">
                {/* Desktop / tablet top navigation */}
                <DesktopTopNav />

                {/* Main content area: mobile remains centered max-w-md, desktop expands */}
                <div className="flex-1 px-0 pb-20 pt-0 md:px-6 md:pb-6 md:pt-4 lg:px-8">
                  <div className="mx-auto w-full max-w-md md:max-w-none">
                    {children}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile bottom navigation (hidden on md+) */}
            <BottomNav />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
