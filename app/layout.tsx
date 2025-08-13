import type { Metadata } from "next";
import { JetBrains_Mono, Open_Sans } from "next/font/google";

import ReduxProvider from "@/components/Providers/ReduxProvider";
import { ThemeWrapper } from "@/components/Providers/ThemeWrapper";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { currentUser } from "@clerk/nextjs/server";
import { SimpleSidebar } from "../components/SideBar/SimpleSidebar";
import "./globals.css";
import NavBarMobile from "../components/NavBars/NavBarMobile";
import MenuDemo2 from "../components/Menu/MenuDemo2";

const openSans = Open_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UPSC Overflow",
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
          className={`${openSans.variable} ${jetbrainsMono.variable} font-mono antialiased w-screen min-h-screen overflow-x-hidden relative`}
        >
          <ThemeWrapper>
            <SidebarProvider>
              <SimpleSidebar />
              <main className="flex-1 flex flex-col items-center justify-center overflow-x-hidden py-8 min-[640px]:py-14 md:py-4">
                <header className="fixed top-0 right-4 flex justify-end items-center p-4 gap-4 z-10 rounded-full">
                  <MenuDemo2 />
                </header>

                <NavBarMobile className="md:hidden flex" />

                <div className="fixed left-2 top-3 z-50">
                  <SidebarTrigger className="hidden md:flex cursor-pointer bg-background/80 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all size-10" />
                </div>

                {children}

                <Toaster />
              </main>
            </SidebarProvider>
          </ThemeWrapper>
        </body>
      </html>
    </ReduxProvider>
  );
}
