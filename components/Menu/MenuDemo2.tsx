"use client";

import {
  FloatingActionPanelButton,
  FloatingActionPanelContent,
  FloatingActionPanelForm,
  FloatingActionPanelRoot,
  FloatingActionPanelTextarea,
  FloatingActionPanelTrigger,
} from "@/components/ui/floating-action-panel";
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark, shadcn } from "@clerk/themes";
import { AlignJustify, LogIn, LogOut, UserPlus } from "lucide-react";
import { SwitchDemo } from "../Switch/SwitchDemo";
import { Button } from "../ui/button";
import { RootState } from "../../lib/redux/store";
import { useSelector } from "react-redux";

export default function MenuDemo2() {
  const handleNoteSubmit = (note: string) => {
    console.log("Submitted note:", note);
  };
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <FloatingActionPanelRoot>
      {({ mode }) => (
        <>
          <div className="flex items-center space-x-4">
            <FloatingActionPanelTrigger
              title="Project Actions"
              mode="actions"
              className="cursor-pointer rounded-full p-4 flex items-center justify-center "
            >
              <AlignJustify />
            </FloatingActionPanelTrigger>
          </div>

          <FloatingActionPanelContent>
            {mode === "actions" ? (
              <div className="space-y-1 p-2">
                {/* Mode Switch */}
                <FloatingActionPanelButton
                  onClick={() => console.log("New Project")}
                >
                  <SwitchDemo />
                </FloatingActionPanelButton>

                {/* When user is not signed in */}
                <SignedOut>
                  {/* Sign In Button */}
                  <FloatingActionPanelButton
                    onClick={() => console.log("Upload Assets")}
                  >
                    <SignInButton>
                      <Button
                        className="cursor-pointer w-full h-full"
                        variant="outline"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Button>
                    </SignInButton>
                  </FloatingActionPanelButton>

                  {/* Sign Up Button */}
                  <FloatingActionPanelButton
                    onClick={() => console.log("Upload Assets")}
                  >
                    <SignUpButton>
                      <Button
                        className="cursor-pointer w-full h-full"
                        variant="outline"
                      >
                        <UserPlus className="h-4 w-4" />
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </FloatingActionPanelButton>
                </SignedOut>

                {/* When user is signed in */}
                <SignedIn>
                  <FloatingActionPanelButton
                    onClick={() => console.log("Theme Settings")}
                  >
                    <UserButton
                      showName={true}
                      appearance={{
                        elements: {
                          userButtonBox: "text-foreground",
                        },
                      }}
                    />
                  </FloatingActionPanelButton>
                  <FloatingActionPanelButton
                    onClick={() => console.log("Theme Settings")}
                  >
                    <SignOutButton>
                      <Button
                        className="cursor-pointer w-full h-full"
                        variant="outline"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    </SignOutButton>
                  </FloatingActionPanelButton>
                </SignedIn>
              </div>
            ) : (
              <FloatingActionPanelForm
                onSubmit={handleNoteSubmit}
                className="p-2"
              >
                <FloatingActionPanelTextarea
                  className="mb-2 h-24"
                  id="project-note"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Save Note
                  </button>
                </div>
              </FloatingActionPanelForm>
            )}
          </FloatingActionPanelContent>
        </>
      )}
    </FloatingActionPanelRoot>
  );
}
