import type { Metadata } from "next";
import { JetBrains_Mono, Open_Sans } from "next/font/google";
import ReduxProvider from "@/components/Providers/ReduxProvider";
import { ThemeWrapper } from "@/components/Providers/ThemeWrapper";
import { Toaster } from "@/components/ui/sonner";
import { currentUser } from "@clerk/nextjs/server";
import "./globals.css";
import { Footerdemo } from "@/components/ui/footer/footer-section";
import { ScrollNavigationMenu } from "@/components/ui/navbar/scroll-navigation-menu";
import { QueryProvider } from "@/components/Providers/QueryProvider";

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
      <html lang="en" suppressHydrationWarning={true}>
        <head>
          {/* <script src="http://localhost:8097"></script> */}
        </head>
        <body
          className={`${openSans.variable} ${jetbrainsMono.variable} font-mono antialiased w-screen min-h-screen overflow-x-hidden relative always-show-scrollbar`}
          suppressHydrationWarning={true}
        >
          <ThemeWrapper>
            <main className="container mx-auto flex-1 flex flex-col items-center justify-center overflow-x-hidden pt-12 min-[640px]:pt-26 always-show-scrollbar pb-8">
              <ScrollNavigationMenu />
              <QueryProvider>{children}</QueryProvider>
              <Toaster />
            </main>
            <Footerdemo />
          </ThemeWrapper>
        </body>
      </html>
    </ReduxProvider>
  );
}
