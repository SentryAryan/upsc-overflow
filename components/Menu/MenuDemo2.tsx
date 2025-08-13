"use client";

import * as React from "react";
import {
  Plus,
  Upload,
  Palette,
  Share2,
  BookMarked,
  AlignJustify,
} from "lucide-react";
import {
  FloatingActionPanelRoot,
  FloatingActionPanelTrigger,
  FloatingActionPanelContent,
  FloatingActionPanelButton,
  FloatingActionPanelForm,
  FloatingActionPanelTextarea,
} from "@/components/ui/floating-action-panel";
import { SwitchDemo } from "../Switch/SwitchDemo";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "../ui/button";
import {} from "lucide-react";

export default function MenuDemo2() {
  const handleNoteSubmit = (note: string) => {
    console.log("Submitted note:", note);
  };
  const { user } = useUser();

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
                    <div className="flex items-center gap-2">
                      <UserButton />
                      <p className="text-sm text-white">{`${user?.firstName} ${user?.lastName}`}</p>
                    </div>
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
