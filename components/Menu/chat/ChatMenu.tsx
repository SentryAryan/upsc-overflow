"use client";

import {
  FloatingActionPanelButton,
  FloatingActionPanelContent,
  FloatingActionPanelForm,
  FloatingActionPanelRoot,
  FloatingActionPanelTextarea,
  FloatingActionPanelTrigger,
} from "@/components/Menu/chat/chat-floating-action-panel";
import { MessageCircle, MessageCircleMore } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../../lib/redux/store";
import { ChatTabTypeSchema } from "@/db/models/chatTab.model";
import { cn } from "../../../lib/utils";

export default function ChatMenu({
  chatTabs,
  setSelectedChatTab,
  selectedChatTab,
}: {
  chatTabs: ChatTabTypeSchema[];
  setSelectedChatTab: React.Dispatch<
    React.SetStateAction<ChatTabTypeSchema | null>
  >;
  selectedChatTab: ChatTabTypeSchema | null;
}) {
  const handleNoteSubmit = (note: string) => {
    console.log("Submitted note:", note);
  };
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <FloatingActionPanelRoot>
      {({ mode }) => (
        <>
          <div className="flex items-center space-x-4 w-full">
            <FloatingActionPanelTrigger
              title="View All Chats :"
              mode="actions"
              className="cursor-pointer rounded-full p-4 flex items-center justify-center gap-2 shadow-md font-[900]! w-full"
            >
              <MessageCircle className="h-4 w-4 font-[900]" />
              <p className="text-md">View All Chats</p>
            </FloatingActionPanelTrigger>
          </div>

          <FloatingActionPanelContent>
            {mode === "actions" ? (
              <div className="flex flex-col justify-center items-center gap-6 p-4">
                {chatTabs.map((chatTab) => {
                  const name =
                    chatTab.name.length > 50
                      ? `${chatTab.name.slice(0, 50)}...`
                      : chatTab.name;
                  return (
                    <div
                      key={chatTab?._id?.toString() as string}
                      className="w-full flex justify-center px-1 group relative"
                    >
                      <span
                        key={chatTab?._id?.toString() as string}
                        onClick={() => {
                          setSelectedChatTab(chatTab);
                        }}
                        className={cn(
                          "w-[95%] py-2 px-4 flex justify-start items-center gap-2 rounded-full! hover:bg-muted hover:text-primary cursor-pointer transition-all ease-in-out duration-300 hover:scale-105 border-2 border-border",
                          selectedChatTab?._id?.toString() ===
                            chatTab?._id?.toString() &&
                            "bg-muted shadow-md border-2! border-primary! text-primary"
                        )}
                      >
                        <MessageCircleMore width={20} height={20} />
                        {name}
                      </span>

                      {/* Tooltip: hidden by default, shows on hover */}
                      <div
                        className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 rounded-md border-mode bg-background p-2 text-sm text-muted-foreground
                        opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-150 z-200"
                      >
                        {chatTab.name}
                      </div>
                    </div>
                  );
                })}
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
