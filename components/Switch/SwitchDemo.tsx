"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toggleDarkMode } from "@/lib/redux/slices/theme.slice";
import { RootState } from "@/lib/redux/store";
import { useDispatch, useSelector } from "react-redux";

export function SwitchDemo() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <div className="flex items-center space-x-2 border-3 border-border rounded-full p-1">
      <Switch
        checked={isDarkMode}
        onCheckedChange={() => dispatch(toggleDarkMode())}
        id="dark-mode"
        className="cursor-pointer dark"
      />
      <Label htmlFor="dark-mode">
        {isDarkMode ? "Dark Mode" : "Light Mode"}
      </Label>
    </div>
  );
}
