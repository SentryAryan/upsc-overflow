import {
  ClerkProvider,
  SignInButton,
  SignOutButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { currentUser } from "@clerk/nextjs/server";
import { SimpleSidebar } from "../components/SideBar/SimpleSidebar";
import { Button } from "../components/ui/button";
import ReduxProvider from "@/components/Providers/ReduxProvider";
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
            className={`${geistSans.variable} ${geistMono.variable} antialiased w-screen min-h-screen overflow-x-hidden relative`}
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
