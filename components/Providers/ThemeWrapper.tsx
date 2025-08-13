"use client";

import { RootState } from "@/lib/redux/store";
import { useSelector } from "react-redux";
import { ClerkProvider } from "@clerk/nextjs";
import { dark, shadcn } from "@clerk/themes";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <ClerkProvider appearance={{
      baseTheme: isDarkMode ? dark : shadcn,
    }}>
      <div className={`bg-background w-full text-foreground transition-all duration-300 ease-in-out ${isDarkMode ? 'dark' : ''} overflow-x-hidden`}>
        {children}
      </div>
    </ClerkProvider>
  );
}
