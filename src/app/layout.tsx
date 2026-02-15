import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "동아리 매니저",
    description: "동아리/동호회 관리 서비스",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
            {children}
            <Toaster richColors position="top-center" />
        </SessionProvider>
        </body>
        </html>
    );
}