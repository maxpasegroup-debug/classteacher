import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import AppProviders from "@/components/providers/AppProviders";

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
          <div className="mx-auto min-h-screen w-full max-w-md bg-slate-50 pb-20">{children}</div>
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
