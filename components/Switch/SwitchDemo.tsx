"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toggleDarkMode } from "@/lib/redux/slices/theme.slice";
import { RootState } from "@/lib/redux/store";
import { Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

export function SwitchDemo() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <div className="flex items-center space-x-2 rounded-full p-1 w-full justify-start">
      <Label htmlFor="dark-mode" className="cursor-pointer text-sm">
        Mode :
      </Label>
      <Sun className="h-4 w-4" />
      <Switch
        checked={isDarkMode}
        onCheckedChange={() => dispatch(toggleDarkMode())}
        id="dark-mode"
        className="cursor-pointer dark"
      />
      <Moon className="h-4 w-4" />
    </div>
  );
}
