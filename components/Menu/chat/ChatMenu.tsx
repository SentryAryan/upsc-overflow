"use client";

import React from "react";
import {
 FloatingActionPanelButton,
 FloatingActionPanelContent,
 FloatingActionPanelForm,
 FloatingActionPanelRoot,
 FloatingActionPanelTextarea,
 FloatingActionPanelTrigger,
} from "@/components/Menu/chat/chat-floating-action-panel";
import { MessageCircle, MessageCircleMore, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../../lib/redux/store";
import { ChatTabTypeSchema } from "@/db/models/chatTab.model";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import PulsatingLoader from "../../Loaders/PulsatingLoader";
import { UseChatStatus } from "../../../app/chat/page";
import { useMediaQuery } from "react-responsive";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function ChatMenu({
 chatTabs,
 setSelectedChatTab,
 selectedChatTab,
 handleNewChatCreate,
 chatTabsLoading,
 status,
}: {
 chatTabs: ChatTabTypeSchema[];
 setSelectedChatTab: React.Dispatch<
  React.SetStateAction<ChatTabTypeSchema | null>
 >;
 selectedChatTab: ChatTabTypeSchema | null;
 handleNewChatCreate: () => Promise<void>;
 chatTabsLoading: boolean;
 status: UseChatStatus;
}) {
 const handleNoteSubmit = (note: string) => {
  console.log("Submitted note:", note);
 };
 const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
 const isMobile = useMediaQuery({ maxWidth: 320 });

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
       {/* <div className="absolute top-0 left-0 w-full h-full">
                <CircleX className="w-4 h-4" />
              </div> */}
      </FloatingActionPanelTrigger>
     </div>

     <FloatingActionPanelContent>
      {mode === "actions" ? (
       <div className="flex flex-col justify-center items-center gap-6 p-4">
        {/* New Chat Button */}
        <Button
         onClick={handleNewChatCreate}
         disabled={status === "submitted" || status === "streaming"}
         variant="outline"
         className="w-full hover:scale-105 transition-all ease-in-out duration-300 cursor-pointer font-[900]! flex justify-center items-center mb-2"
        >
         <Plus className="w-5 h-5" /> New Chat
        </Button>

        {/* Show loader while waiting for chat tabs to load or when creating a new chat tab */}
        {chatTabsLoading && (
         <div className="w-full flex flex-col items-center justify-center py-4">
          <PulsatingLoader />
         </div>
        )}

        {/* Chat Tabs */}
        <ScrollArea className="h-72 overflow-hidden always-show-scrollbar flex flex-col justify-center items-center gap-6 p-4 rounded-md border-2 border-border always-show-scrollbar!">
         {chatTabs.map((chatTab, index) => {
          const name = isMobile
           ? chatTab.name.length > 13
             ? `${chatTab.name.slice(0, 10)}...`
             : chatTab.name
           : chatTab.name.length > 50
             ? `${chatTab.name.slice(0, 50)}...`
             : chatTab.name;
          return (
           <React.Fragment key={chatTab?._id?.toString() as string}>
            <div
             className={cn(
              "w-full flex justify-center px-1 group relative mt-4",
              index === 0 && "mt-0"
             )}
            >
             <span
              key={chatTab?._id?.toString() as string}
              onClick={() => {
               if (status === "ready") {
                setSelectedChatTab(chatTab);
               }
              }}
              className={cn(
               "w-[95%] sm:max-w-full py-2 sm:px-4 px-6 flex justify-start items-center gap-2 rounded-full! hover:bg-muted hover:text-primary cursor-pointer transition-all ease-in-out duration-300 hover:scale-105 border-2 border-border",
               selectedChatTab?._id?.toString() === chatTab?._id?.toString() &&
                "bg-muted shadow-md border-2! border-primary! text-primary"
              )}
             >
              <MessageCircleMore width={20} height={20} />
              {name}
             </span>

             {/* Tooltip: hidden by default, shows on hover */}
             <div
              className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 w-64 rounded-md border-mode bg-background p-2 text-sm text-muted-foreground
                        opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-150 z-200 max-w-[270px] truncate"
             >
              {chatTab.name}
             </div>
            </div>
            {/* <Separator className="mt-2 mb-2" /> */}
           </React.Fragment>
          );
         })}
        </ScrollArea>
       </div>
      ) : (
       <FloatingActionPanelForm onSubmit={handleNoteSubmit} className="p-2">
        <FloatingActionPanelTextarea className="mb-2 h-24" id="project-note" />
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
