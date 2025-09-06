"use client"

import { Theme } from "@/components/ui/theme-switcher/theme";

export const ThemeSwitcher = () => {
  return (
    <Theme
      variant="tabs"
      size="md"
      showLabel
      themes={["light", "dark", "system"]}
    />
  );
};
