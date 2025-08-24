import "@/styles/global.scss";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jet = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Sankofa",
  description: "Empowering youth. Strengthening democracy.",
  icons: { icon: "/public/logo-sankofa.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jet.variable}`}>
      <body>
        <Header />
        <main className="main">
          <div className="container">{children}</div>
        </main>
        <Sidebar />
      </body>
    </html>
  );
}