import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Changed from Geist to Inter
import "./globals.css";

const inter = Inter({ subsets: ["latin"] }); // Changed from Geist to Inter

export const metadata: Metadata = {
  title: "Yappy Payment API", // Updated title
  description: "API for Yappy payments with Next.js and Supabase", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
