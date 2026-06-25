import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "C.U.B. Code",
  description:
    "C.U.B. Code calculates earned digital freedom. Parents control access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark min-h-dvh antialiased`}
    >
      <body className="min-h-dvh bg-cub-ebony text-zinc-100">
        {children}
      </body>
    </html>
  );
}
