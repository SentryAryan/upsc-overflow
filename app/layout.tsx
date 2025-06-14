import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Merriweather } from "next/font/google";

import ReduxProvider from "@/components/Providers/ReduxProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { currentUser } from "@clerk/nextjs/server";
import { SimpleSidebar } from "../components/SideBar/SimpleSidebar";
import { Button } from "../components/ui/button";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
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
        <html lang="en" className="dark">
          <body
            className={`${inter.variable} ${merriweather.variable} ${jetbrainsMono.variable} font-serif antialiased w-screen min-h-screen overflow-x-hidden relative`}
          >
            <SidebarProvider>
              <SimpleSidebar />
              <main className="flex-1 flex flex-col items-center justify-center">
                <header className="fixed top-0 right-0 flex justify-end items-center p-4 gap-4 z-10 bg-background/80 backdrop-blur-sm">
                  <SignedOut>
                    <SignInButton>
                      <Button variant="outline" className="cursor-pointer">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton>
                      <Button variant="outline" className="cursor-pointer">
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                    {/* <p className="text-sm text-white font-bold">
                      {user?.firstName} {user?.lastName}
                    </p> */}
                    {/* <SignOutButton>
                      <Button variant="outline" className="cursor-pointer">
                        Sign Out
                      </Button>
                    </SignOutButton> */}
                  </SignedIn>
                </header>

                <div className="fixed left-2 top-3 z-50">
                  <SidebarTrigger className="cursor-pointer bg-background/80 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all size-10" />
                </div>

                {children}

                <Toaster />
              </main>
            </SidebarProvider>
          </body>
        </html>
      </ReduxProvider>
    </ClerkProvider>
  );
}

