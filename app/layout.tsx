import type { Metadata } from "next";
import { JetBrains_Mono, Open_Sans } from "next/font/google";
import ReduxProvider from "@/components/Providers/ReduxProvider";
import { ThemeWrapper } from "@/components/Providers/ThemeWrapper";
import { Toaster } from "@/components/ui/sonner";
import { currentUser } from "@clerk/nextjs/server";
import "./globals.css";
import { Footerdemo } from "@/components/ui/footer/footer-section";
import { ScrollNavigationMenu } from "@/components/ui/navbar/scroll-navigation-menu";

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UPSC Overflow | Aryan Srivastaav",
  description: "A community platform for UPSC aspirants",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  return (
    <ReduxProvider>
      <html lang="en">
        <body
          className={`${openSans.variable} ${jetbrainsMono.variable} font-mono antialiased w-screen min-h-screen overflow-x-hidden relative always-show-scrollbar`}
        >
          <ThemeWrapper>
            <main className="container mx-auto flex-1 flex flex-col items-center justify-center overflow-x-hidden pt-12 min-[640px]:pt-26 always-show-scrollbar">
              <ScrollNavigationMenu />
              {children}
              <Footerdemo />
              <Toaster />
            </main>
          </ThemeWrapper>
        </body>
      </html>
    </ReduxProvider>
  );
}
