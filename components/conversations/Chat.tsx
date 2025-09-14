"use client";

import type {
  LoadMore,
  MessageType,
  Status,
} from "@/app/conversation/[conversationId]/page";
import PulsatingLoader from "@/components/Loaders/PulsatingLoader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { ArrowDown, Check, Copy, Send, BookUser, User } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Spotlight } from "../ui/spotlight";

interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  imageUrl: string;
}

interface ChatProps {
  sender: UserType;
  receiver: UserType;
  messages: MessageType[];
  loadMore: LoadMore;
  limit: number;
  status: Status;
  isLoading: boolean;
  isReceiverUserLoading: boolean;
}

const suggestions = [
  "How does AI work?",
  "Are black holes real?",
  'How many rs are in word "strawberry?"',
  "What is the meaning of life?",
  "Explain quantum entanglement?",
  "What is the capital of INDIA?",
  "Explain the usage of AI in the future?",
  "What is hyperelasticity?",
];

const Chat = ({
  sender,
  receiver,
  messages,
  loadMore,
  limit,
  status,
  isLoading,
  isReceiverUserLoading,
}: ChatProps) => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const sendMessage = useMutation(api.tasks.sendMessage);

  // scrolling refs/state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastMsgRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyMessageToClipboard = async (
    id: string,
    parts: Array<{ type: string; text?: string }>
  ) => {
    const text = parts
      .filter(
        (part) => part && part.type === "text" && typeof part.text === "string"
      )
      .map((part) => part.text as string)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Message copied to clipboard");
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (e) {
      toast.error("Failed to copy message to clipboard");
    }
  };

  const checkIfAtBottom = () => {
    const el = containerRef.current;
    if (!el) return true;
    const threshold = 100; // px tolerance
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onUserScroll = () => setAutoScroll(checkIfAtBottom());
    el.addEventListener("scroll", onUserScroll, { passive: true });
    return () => el.removeEventListener("scroll", onUserScroll);
  }, []);

  const scrollToBottom = (smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    setAutoScroll(true);
    const behavior = smooth ? "smooth" : "auto";
    // Prefer scrolling to a bottom sentinel (or last message) if present
    const target = bottomRef.current ?? lastMsgRef.current;
    if (target) {
      // small timeout to ensure DOM has updated
      window.setTimeout(() => {
        try {
          target.scrollIntoView({
            behavior: behavior as any,
            block: "end",
          });
        } catch {
          el.scrollTo({ top: el.scrollHeight, behavior });
        }
      }, 30);
      return;
    }

    // Fallback: scroll container to bottom smoothly with RAF/debounce
    if (typeof requestAnimationFrame !== "undefined") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        rafRef.current = requestAnimationFrame(() => {
          try {
            el.scrollTo({ top: el.scrollHeight, behavior });
          } catch {
            el.scrollTop = el.scrollHeight;
          }
        });
      }, 50);
    } else {
      el.scrollTop = el.scrollHeight;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      console.log("receiver.fullName =", receiver.fullName);
      const response = await sendMessage({
        content: input,
        sender: {
          id: sender?.id || "",
          firstName: sender?.firstName ?? "",
          lastName: sender?.lastName ?? "",
          fullName: sender?.fullName ?? "",
          imageUrl: sender?.imageUrl ?? "",
        },
        receiver: {
          id: receiver?.id || "",
          firstName: receiver?.firstName ?? "",
          lastName: receiver?.lastName ?? "",
          fullName: receiver?.fullName ?? "",
          imageUrl: receiver?.imageUrl ?? "",
        },
      });
      if (!response.success) {
        toast.error(response.message || "Error sending message");
        return;
      } else {
        toast.success(response.message || "Message sent successfully");
        setInput("");
      }
    }
  };

  useEffect(() => {
    if (!autoScroll) return;
    const el = containerRef.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      rafRef.current = requestAnimationFrame(() => {
        try {
          el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        } catch {
          lastMsgRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      });
    }, 60);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [messages, autoScroll]);
  return (
    <div className="container mx-auto flex flex-col items-center w-full px-4 gap-8 pt-12 md:pt-4 scroll-smooth">
      {/* Spotlight */}
      <Spotlight className="fixed top-0 left-0" fill="#1c9cf0" />

      {/* Title */}
      <div className="flex items-center justify-center gap-4 text-card-foreground mt-10 md:mt-0">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow-no-hover">
          <Image
            src={receiver.imageUrl}
            alt="User"
            width={56}
            height={56}
            className="rounded-full"
          />
        </span>
        <h1
          className="text-4xl md:text-5xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center"
        >
          {receiver.fullName}
        </h1>
      </div>

      {/* Messages */}
      <div
        className={cn(
          "w-full bg-background border-mode rounded-lg p-4 md:p-6 card-shadow-no-hover scroll-smooth flex flex-col items-center justify-between min-h-screen"
        )}
      >
        {/* Title */}
        <div className="flex items-center justify-center gap-4 text-card-foreground mt-10 md:mt-0">
          <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow-no-hover">
            <BookUser className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold bg-clip-text 
        text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center"
          >
            Grow together
          </h1>
        </div>

        {/* Messages */}
        <div
          ref={containerRef}
          className={`w-full flex flex-col gap-3 scroll-smooth`}
        >
          {/* Loader */}
          {(isLoading || isReceiverUserLoading) && (
            <div className="w-full flex flex-col items-center justify-center py-4">
              <PulsatingLoader />
            </div>
          )}

          {/* Suggestions */}
          {messages.length === 0 && input.trim() === "" && (
            <div className="w-full min-h-screen flex flex-col items-center justify-center py-4">
              <div className="flex flex-col items-center">
                {user?.imageUrl ? (
                  <Image
                    src={user?.imageUrl}
                    alt="User"
                    width={56}
                    height={56}
                    className="rounded-full ring-2 ring-primary/20 shadow-sm"
                  />
                ) : (
                  <User className="w-12 h-12" />
                )}
                <p className="mt-3 text-xl md:text-2xl font-bold text-center">
                  Hello, {user?.fullName || "User"}?
                </p>
                <p className="mt-1 text-sm text-muted-foreground text-center">
                  Try one of these messages to get started
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-2 max-w-2xl w-full">
                {suggestions.map((s: string) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="group w-full text-left px-4 py-3 rounded-lg border-mode bg-background hover:bg-primary/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm md:text-base">{s}</span>
                      <Send className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, i) => {
            return (
              <div
                key={message._id}
                ref={i === messages.length - 1 ? lastMsgRef : undefined}
                className={`whitespace-pre-wrap p-3 rounded-md border-mode flex flex-col gap-2 ${
                  message.sender.id === user?.id
                    ? "bg-primary/5 ml-auto"
                    : "bg-background mr-auto"
                }`}
              >
                {/* Message Header */}
                <section className="flex items-center gap-2">
                  {message.sender.imageUrl ? (
                    <Image
                      src={message.sender.imageUrl}
                      alt="User"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <User />
                  )}
                  <span className="text-lg font-[900] text-primary mr-2">
                    {message.sender.fullName || "User"}:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyMessageToClipboard(
                        message._id,
                        message.content as any
                      )
                    }
                    className={`ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground  cursor-pointer font-[900]! ${
                      copiedId === message._id
                        ? "text-green-500 hover:bg-green-500/20"
                        : "hover:bg-muted"
                    } transition-all ease-in-out duration-300 hover:scale-105`}
                    title="Copy message"
                  >
                    {copiedId === message._id ? (
                      <>
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </section>

                {/* Message Content */}
                <span className="text-sm md:text-base">{message.content}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Composer Input and Send Button */}
      <div className="mt-6 fixed bottom-1 left-0 right-0 flex justify-center items-center w-screen px-6 md:px-10">
        <form
          onSubmit={handleSubmit}
          className="container relative w-full flex flex-col justify-center items-center h-full bg-background rounded-xl shadow-lg border-2 border-border max-w-5xl"
        >
          <Textarea
            className="py-6 px-4 rounded-xl bg-background! border-mode font-md container! w-full! disabled:opacity-100! border-2 shadow-none! border-none! resize-none! ring-0! focus-visible:ring-0! focus-visible:ring-offset-0! focus-visible:outline-none! focus-visible:border-none! hover:outline-none! hover:ring-none! focus:outline-none! focus:ring-none! focus:ring-offset-none!"
            rows={1}
            style={{
              height: "scroll",
              minHeight: "60px",
              maxHeight: "200px",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.currentTarget.value)}
          />

          {/* Send/Stop/Go-to-latest-message Buttons */}
          <div className="w-full flex flex-row gap-4 sm:gap-2 justify-between items-center px-2 pb-2">
            {/* Go to latest button and Load More button */}
            <div className="w-full flex flex-col sm:flex-row gap-2 justify-start items-start">
              {/* Go to latest button */}
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToBottom(true);
                }}
                className="w-full sm:w-max flex! justify-center! items-center! gap-2 px-3 py-1 text-sm rounded-md bg-background! text-foreground hover:scale-105 transition-transform ease-in-out duration-300 cursor-pointer font-[900]!"
              >
                Go to latest message{" "}
                <ArrowDown className="w-4 h-4 font-[900]!" />
              </Button>

              {/* Load More button */}
              {status === "CanLoadMore" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    loadMore(limit);
                  }}
                  className="w-full sm:w-max flex! justify-center! items-center! gap-2 px-3 py-1 text-sm rounded-md bg-background! text-foreground hover:scale-105 transition-transform ease-in-out duration-300 cursor-pointer font-[900]!"
                >
                  Load Previous Messages
                </Button>
              )}
            </div>

            {/* Send button */}
            <Button
              type="submit"
              variant="outline"
              size="icon"
              className="w-max flex justify-center items-center rounded-full transition-transform hover:scale-105 p-2 gap-2"
            >
              <Send className="h-8 w-8" />
              <span>Send</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Bottom sentinel to ensure reliable scroll-to-bottom */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
};

export default Chat;
