"use client";

import { RootState } from "@/lib/redux/store";
import { useSelector } from "react-redux";
import { ClerkProvider } from "@clerk/nextjs";
import { dark, shadcn } from "@clerk/themes";
import { GridBackground } from "../ui/grid-background";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Spotlight as SpotlightNew } from "../ui/spotlight-new";
import { Spotlight } from "../ui/spotlight";
import { VisualSpotlightShowcase } from "@/components/ui/hero-spotlight";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDarkMode ? dark : shadcn,
      }}
    >
      <ConvexClientProvider>
        <div
          className={`w-full text-foreground transition-all duration-300 ease-in-out ${
            isDarkMode ? "dark" : ""
          } overflow-x-hidden`}
        >
          {/* <VisualSpotlightShowcase /> */}
          {/* <SpotlightNew /> */}
          {/* <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        /> */}
          <GridBackground />
          {children}
        </div>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
