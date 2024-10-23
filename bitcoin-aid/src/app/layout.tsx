import type { Metadata } from "next";
import { Libre_Franklin } from "next/font/google";
import { useEffect, useState } from "react";
import "./globals.css";
import Header from "../componentes/header";
import Footer from "@/componentes/footer";
import Burned from "@/componentes/burned"
import Trophy from "@/componentes/trophy";
import { WalletProvider } from "@/services/walletContext";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/react";
import Links from "@/componentes/links";



const franklin = Libre_Franklin({ subsets: ["latin"] });
import "flag-icons/css/flag-icons.min.css";



export const metadata: Metadata = {
  title: "BTCA",
  description: "Innovative system of fair income distribution.",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
     
      <head>
        <title>BTCA</title>
        <link rel="icon" href="/images/LogoBTCA-PNG.png" />
      </head>
      <body className="bg-gradient-to-t to-[#201f1b] from-[#000000]">
        <Image alt="bg" src={'/images/World.png'} width={1000} height={1000} className="absolute z-[-1] opacity-[20%]"></Image>
        <WalletProvider> {/* Envolva o conteúdo com o WalletProvider */}
          <Header />
          <Burned/>
          <Analytics />
          <main className={franklin.className}>{children}</main>
          
          <Trophy />
          <Links/>
          <Footer/>
        </WalletProvider>

      </body>
    </html>
  );
}
