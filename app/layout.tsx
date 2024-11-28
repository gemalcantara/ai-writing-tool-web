import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./App.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Writing Tool",
  description: "AI Writing Tool using chat gpt4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: "unset" }}>{children}</body>
    </html>
  );
}
