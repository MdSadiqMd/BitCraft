import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';

import "./globals.css";
import AppLayout from "@/components/appLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Bit Craft",
    description: "Build on Cloudflare and Cloudinary",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={inter.className}>
                    <AppLayout>
                        {children}
                    </AppLayout>
                </body>
            </html>
        </ClerkProvider>
    );
}
