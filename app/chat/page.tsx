"use client";

import PulsatingLoader from "@/components/Loaders/PulsatingLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spotlight } from "@/components/ui/spotlight";
import { useChat } from "@ai-sdk/react";
import { useUser } from "@clerk/nextjs";
import { ArrowDown, Ban, Brain, Check, Copy, Send } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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

export default function Chat() {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const { messages, sendMessage, stop, status } = useChat();
  console.log(status);
  console.log(messages);
  // console.log(user);

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
      .filter((p) => p && p.type === "text" && typeof p.text === "string")
      .map((p) => p.text as string)
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

  // Ensure we start at the bottom on first mount
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && status === "ready") {
      sendMessage({ text: input });
      setInput("");
      // schedule a short scroll to the last attached message after DOM updates
      window.setTimeout(() => scrollToBottom(true), 40);
    }
  };

  // auto-scroll when messages change, but only if user is at bottom
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
    <div className="container mx-auto flex flex-col items-center w-full px-6 md:px-10 gap-8 pt-12 md:pt-0 min-h-screen scroll-smooth">
      {/* Title */}
      <div className="flex items-center justify-center gap-4 text-card-foreground mt-6 md:mt-2">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow-no-hover">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center">
          AI Chat
        </h1>
      </div>

      {/* Messages */}
      <div className="w-full bg-background border-mode rounded-lg p-4 md:p-6 card-shadow-no-hover min-h-screen scroll-smooth">
        {/* Spotlight */}
        <Spotlight className="-top-160 left-0 hidden md:block" fill="#1c9cf0" />

        {/* Messages */}
        <div ref={containerRef} className="flex flex-col gap-3 scroll-smooth">
          {/* Suggestions */}
          {messages.length === 0 && input.trim() === "" && (
            <div className="w-full flex flex-col items-center justify-center py-4">
              <div className="flex flex-col items-center">
                {user?.imageUrl && (
                  <Image
                    src={user?.imageUrl || ""}
                    alt="User"
                    width={56}
                    height={56}
                    className="rounded-full ring-2 ring-primary/20 shadow-sm"
                  />
                )}
                <p className="mt-3 text-xl md:text-2xl font-bold text-center">
                  How can I help you, {user?.fullName || "User"}?
                </p>
                <p className="mt-1 text-sm text-muted-foreground text-center">
                  Try one of these questions to get started
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
          {messages.map((message, i) => (
            <div
              key={message.id}
              ref={i === messages.length - 1 ? lastMsgRef : undefined}
              className={`whitespace-pre-wrap p-3 rounded-md border-mode ${
                message.role === "user" ? "bg-primary/5" : "bg-background"
              }`}
            >
              {/* Message Header */}
              <section className="flex items-center gap-2">
                {message.role === "user" ? (
                  <Image
                    src={user?.imageUrl || ""}
                    alt="User"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <Brain />
                )}
                <span className="text-sm font-[900] text-muted-foreground mr-2">
                  {message.role === "user"
                    ? `${user?.fullName || "User"}`
                    : "AI"}
                  :
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyMessageToClipboard(message.id, message.parts as any)
                  }
                  className={`ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground  cursor-pointer font-[900]! ${
                    copiedId === message.id
                      ? "text-green-500 hover:bg-green-500/20"
                      : "hover:bg-muted"
                  } transition-all ease-in-out duration-300 hover:scale-105`}
                  title="Copy message"
                >
                  {copiedId === message.id ? (
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
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return (
                      <div
                        key={`${message.id}-${i}`}
                        className="mt-1 leading-relaxed"
                      >
                        {part.text}
                      </div>
                    );
                }
              })}
            </div>
          ))}
        </div>

        {/* Show loader while waiting for response to start streaming */}
        {status === "submitted" && (
          <div className="ml-2 flex items-center justify-start mt-6">
            <PulsatingLoader />
          </div>
        )}
      </div>

      {/* Go to latest button */}
      <div className="flex justify-end mb-1 fixed bottom-15 font-[900]">
        <Button
          variant="outline"
          onClick={() => scrollToBottom(true)}
          className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-md bg-background! text-foreground border border-primary hover:scale-105 transition-transform ease-in-out duration-300 cursor-pointer font-[900]!"
        >
          Go to latest <ArrowDown className="w-4 h-4 font-[900]!" />
        </Button>
      </div>

      {/* Chat Composer Input and Send Button */}
      <div className="mt-6 fixed bottom-1 left-0 right-0 flex justify-center w-screen px-6 md:px-10">
        <form onSubmit={handleSubmit} className="container relative">
          <Input
            className="p-6 rounded-xl bg-background! border-mode card-shadow-no-hover font-md container! w-full! disabled:opacity-100! border-2"
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.currentTarget.value)}
            disabled={status === "submitted" || status === "streaming"}
          />

          {/* Show spinner + Stop while waiting/streaming, otherwise Send button */}
          {status === "submitted" || status === "streaming" ? (
            <Button
              type="submit"
              variant="default"
              onClick={() => stop()}
              size="icon"
              className="absolute right-0 top-0 h-12 w-12 rounded-full transition-transform hover:scale-105 p-2 bg-destructive/10 shadow-none border-1 border-destructive"
            >
              <Ban className="h-3 w-3 text-destructive" />
              <span className="sr-only">Stop</span>
            </Button>
          ) : (
            <Button
              type="submit"
              variant="default"
              size="icon"
              className="absolute right-0 top-0 h-12 w-12 rounded-full transition-transform hover:scale-105 p-2"
            >
              <Send className="h-3 w-3" />
              <span className="sr-only">Send</span>
            </Button>
          )}
        </form>
      </div>

      {/* Bottom sentinel to ensure reliable scroll-to-bottom */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
