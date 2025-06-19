import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { JetBrains_Mono, Open_Sans } from "next/font/google";

import ReduxProvider from "@/components/Providers/ReduxProvider";
import { ThemeWrapper } from "@/components/Providers/ThemeWrapper";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { currentUser } from "@clerk/nextjs/server";
import { SimpleSidebar } from "../components/SideBar/SimpleSidebar";
import { SwitchDemo } from "../components/Switch/SwitchDemo";
import { Button } from "../components/ui/button";
import "./globals.css";

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
    <ClerkProvider>
      <ReduxProvider>
        <html lang="en">
          <body
            className={`${openSans.variable} ${jetbrainsMono.variable} font-mono antialiased w-screen min-h-screen overflow-x-hidden relative`}
          >
            <ThemeWrapper>
              <SidebarProvider>
                <SimpleSidebar />
                <main className="flex-1 flex flex-col items-center justify-center">
                  <header className="fixed top-0 right-0 flex justify-end items-center p-4 gap-4 z-10 rounded-full">
                    {/* Theme Switcher */}
                    <div className="rounded-full p-1">
                      <SwitchDemo />
                    </div>
                    {/* When user is not signed in */}
                    <SignedOut>
                      <SignInButton>
                        <Button className="cursor-pointer">Sign In</Button>
                      </SignInButton>
                      <SignUpButton>
                        <Button className="cursor-pointer">Sign Up</Button>
                      </SignUpButton>
                    </SignedOut>
                    {/* When user is signed in */}
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                  </header>

                  <div className="fixed left-2 top-3 z-50">
                    <SidebarTrigger className="cursor-pointer bg-background/80 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all size-10" />
                  </div>

                  {children}

                  <Toaster />
                </main>
              </SidebarProvider>
            </ThemeWrapper>
          </body>
        </html>
      </ReduxProvider>
    </ClerkProvider>
  );
}
