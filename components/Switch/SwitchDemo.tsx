"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toggleDarkMode } from "@/lib/redux/slices/theme.slice";
import { RootState } from "@/lib/redux/store";
import { Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import useSound from "use-sound";

export function SwitchDemo() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [play] = useSound("/sounds/theme-switch-sound.mp3");

  return (
    <div className="flex items-center space-x-2 rounded-full p-1 w-full justify-start">
      <Label htmlFor="dark-mode" className="cursor-pointer text-sm" onClick={() => play()}>
        Mode :
      </Label>
      <Label htmlFor="dark-mode" className="cursor-pointer text-sm">
        <Sun className="h-4 w-4" />
      </Label>
      <Switch
        checked={isDarkMode}
        onCheckedChange={() => {
          dispatch(toggleDarkMode());
          play();
        }}
        id="dark-mode"
        className="cursor-pointer dark"
      />
      <Label htmlFor="dark-mode" className="cursor-pointer text-sm">
        <Moon className="h-4 w-4" />
      </Label>
    </div>
  );
}
