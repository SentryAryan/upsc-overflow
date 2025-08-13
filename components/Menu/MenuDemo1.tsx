"use client";

import { MenuItem, MenuContainer } from "@/components/ui/fluid-menu";
import { Menu as MenuIcon, X, Home, Mail, User, Settings } from "lucide-react";
import { SwitchDemo } from "@/components/Switch/SwitchDemo";

// A fluid circular menu that elegantly expands to reveal navigation items with smooth icon transitions
export function MenuDemo() {
  return (
    <MenuContainer>
      <MenuItem
        icon={
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-100 scale-100 rotate-0 [div[data-expanded=true]_&]:opacity-0 [div[data-expanded=true]_&]:scale-0 [div[data-expanded=true]_&]:rotate-180">
              <MenuIcon size={24} strokeWidth={1.5} />
            </div>
            <div className="absolute inset-0 transition-all duration-300 ease-in-out origin-center opacity-0 scale-0 -rotate-180 [div[data-expanded=true]_&]:opacity-100 [div[data-expanded=true]_&]:scale-100 [div[data-expanded=true]_&]:rotate-0">
              <X size={24} strokeWidth={1.5} />
            </div>
          </div>
        }
      />
      <MenuItem icon={<SwitchDemo />} />
      <MenuItem icon={<Mail size={24} strokeWidth={1.5} />} />
      <MenuItem icon={<User size={24} strokeWidth={1.5} />} />
      <MenuItem icon={<Settings size={24} strokeWidth={1.5} />} />
    </MenuContainer>
  );
}
