"use client";

import { Response } from "@/components/ai-elements/response";
import { SelectModelForm } from "@/components/Forms/select-model/SelectModelForm";
import PulsatingLoader from "@/components/Loaders/PulsatingLoader";
import ChatMenu from "@/components/Menu/chat/ChatMenu";
import { Sidebar, SidebarBody } from "@/components/ui/aceternity/sidebar";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { Textarea } from "@/components/ui/textarea";
import { ChatTypeSchema } from "@/db/models/chat.model";
import { ChatTabTypeSchema } from "@/db/models/chatTab.model";
import { cn } from "@/lib/utils";
import { UIMessage, useChat } from "@ai-sdk/react";
import { useUser } from "@clerk/nextjs";
import { SiGooglegemini, SiNvidia } from "@icons-pack/react-simple-icons";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowDown,
  Ban,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  MessageCircleMore,
  Plus,
  Send,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSound from "use-sound";

export type UseChatReturn = ReturnType<typeof useChat>;
export type UseChatStatus = UseChatReturn["status"];

type ChatProps = {
  selectedChatTab: ChatTabTypeSchema | null;
  setChatTabs: React.Dispatch<React.SetStateAction<ChatTabTypeSchema[]>>;
  setSelectedChatTab: React.Dispatch<
    React.SetStateAction<ChatTabTypeSchema | null>
  >;
  messages: UseChatReturn["messages"];
  sendMessage: UseChatReturn["sendMessage"];
  stop: UseChatReturn["stop"];
  status: UseChatReturn["status"];
  setMessages: UseChatReturn["setMessages"];
  error: UseChatReturn["error"];
  chatTabs: ChatTabTypeSchema[];
  handleNewChatCreate: () => Promise<void>;
  chatTabsLoading: boolean;
};

interface MessageWithAiModel {
  message: UIMessage;
  ai_model: string;
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

export const models = [
  {
    name: "DeepSeek: DeepSeek V3.1 (free)",
    value: "deepseek/deepseek-chat-v3.1:free",
    isReasoningAvailable: true,
    provider: "openrouter",
    icon: Brain,
  },
  {
    name: "TNG: DeepSeek R1T2 Chimera (free)",
    value: "tngtech/deepseek-r1t2-chimera:free",
    isReasoningAvailable: true,
    provider: "openrouter",
    icon: Brain,
  },
  {
    name: "Google: Gemini 2.5 Pro",
    value: "models/gemini-2.5-pro",
    isReasoningAvailable: true,
    provider: "google",
    icon: SiGooglegemini,
  },
  {
    name: "Google: Gemini 2.5 Flash",
    value: "models/gemini-2.5-flash",
    isReasoningAvailable: true,
    provider: "google",
    icon: SiGooglegemini,
  },
  {
    name: "Google: Gemini 2.5 Flash-Lite",
    value: "models/gemini-2.5-flash-lite",
    isReasoningAvailable: true,
    provider: "google",
    icon: SiGooglegemini,
  },
  {
    name: "Google: Gemini 2.0 Flash",
    value: "models/gemini-2.0-flash",
    isReasoningAvailable: false,
    provider: "google",
    icon: SiGooglegemini,
  },
  // {
  //   name: "Google: Gemini 2.0 Flash-Lite",
  //   value: "models/gemini-2.0-flash-lite",
  //   isReasoningAvailable: false,
  //   provider: "google",
  //   icon: SiGooglegemini,
  // },
  {
    name: "Google: Gemini 2.0 Flash Experimental (free)",
    value: "google/gemini-2.0-flash-exp:free",
    isReasoningAvailable: false,
    provider: "openrouter",
    icon: SiGooglegemini,
  },
  // {
  //   name: "Groq: Compound",
  //   value: "groq/compound",
  //   isReasoningAvailable: false,
  //   provider: "groq",
  //   icon: Brain,
  // },
  // {
  //   name: "Llama 3.3 70B",
  //   value: "llama-3.3-70b-versatile",
  //   isReasoningAvailable: false,
  //   provider: "groq",
  //   icon: Brain,
  // },
  // {
  //   name: "Qwen3-32B",
  //   value: "qwen/qwen3-32b",
  //   isReasoningAvailable: true,
  //   provider: "groq",
  //   icon: Brain,
  // },
  {
    name: "Sonoma Dusk Alpha",
    value: "openrouter/sonoma-dusk-alpha",
    isReasoningAvailable: false,
    provider: "openrouter",
    icon: Brain,
  },
  {
    name: "Sonoma Sky Alpha",
    value: "openrouter/sonoma-sky-alpha",
    isReasoningAvailable: true,
    provider: "openrouter",
    icon: Brain,
  },
  {
    name: "NVIDIA: Nemotron Nano 9B V2 (free)",
    value: "nvidia/nemotron-nano-9b-v2:free",
    isReasoningAvailable: true,
    provider: "openrouter",
    icon: SiNvidia,
  },
  {
    name: "Qwen: Qwen3 Coder 480B A35B (free)",
    value: "qwen/qwen3-coder:free",
    isReasoningAvailable: false,
    provider: "openrouter",
    icon: Brain,
  },
  {
    name: "MoonshotAI: Kimi K2 0711 (free)",
    value: "moonshotai/kimi-k2:free",
    isReasoningAvailable: false,
    provider: "openrouter",
    icon: Brain,
  },
  {
    name: "Z.AI: GLM 4.5 Air (free)",
    value: "z-ai/glm-4.5-air:free",
    isReasoningAvailable: true,
    provider: "openrouter",
    icon: Brain,
  },
];

{
  /* Chat Page Component */
}
export default function ChatPage() {
  const [open, setOpen] = useState(false);
  const [chatTabs, setChatTabs] = useState<ChatTabTypeSchema[]>([]);
  const [selectedChatTab, setSelectedChatTab] =
    useState<ChatTabTypeSchema | null>(null);
  const { messages, sendMessage, stop, status, setMessages, error } = useChat();
  const [chatTabsLoading, setChatTabsLoading] = useState<boolean>(true);

  const fetchChatTabs = async () => {
    try {
      setChatTabsLoading(true);
      const response = await axios.get("/api/chat/getAllTabs");
      setChatTabs(response.data.data);
      setSelectedChatTab(response.data.data[0]);
    } catch (error: any) {
      console.log(error.response.data.message);
      if (error.response.data.errors.includes("No chat tabs found")) {
        const response = await axios.post("/api/chat/createChatTab", {
          name: "New Chat Tab",
        });
        setChatTabs(response.data.data);
        setSelectedChatTab(response.data.data[0]);
      }
    } finally {
      setChatTabsLoading(false);
    }
  };

  const handleNewChatCreate = async () => {
    try {
      setChatTabsLoading(true);
      const response = await axios.post("/api/chat/createChatTab", {
        name: "New Chat Tab",
      });
      setChatTabs(response.data.data);
      setSelectedChatTab(response.data.data[response.data.data.length - 1]);
    } catch (error: any) {
      console.log(error.response.data.message);
    } finally {
      setChatTabsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatTabs();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error("Error fetching chat tabs");
    }
  }, [error]);

  // useEffect(() => {
  //   if (status === "ready") {
  //     handleNewChatCreate();
  //   }
  // }, [status]);

  return (
    <div className="w-full flex flex-col gap-6 items-center justify-center">
      {/* Title */}
      <div className="flex items-center justify-center gap-4 text-card-foreground mt-6 md:mt-2">
        <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary border border-primary dark:border-border card-shadow-no-hover">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-accent-foreground to-foreground text-center">
          AI Chat
        </h1>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "rounded-md flex flex-col md:flex-row w-full flex-1 mx-auto bg-transparent overflow-hidden shadow-mode",
          "h-screen pr-4 pl-0 border-2 border-border rounded-lg bg-background" // for your use case, use `h-screen` instead of `h-[60vh]`
        )}
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 bg-backgound! sm:bg-transparent! min-h-screen! rounded-lg!">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden gap-4">
              {open ? <Logo /> : <LogoIcon />}
              {open ? (
                <Button
                  onClick={handleNewChatCreate}
                  variant="outline"
                  disabled={status === "streaming" || status === "submitted"}
                >
                  <Plus className="w-5 h-5" /> New Chat
                </Button>
              ) : (
                <span>
                  <Plus className="w-5 h-5" />
                </span>
              )}
              {chatTabs.length > 0 && (
                <div className="mt-8 flex flex-col gap-4 h-full!">
                  {chatTabs.map((chatTab: ChatTabTypeSchema, index: number) => {
                    const name =
                      chatTab.name.length > 15
                        ? `${chatTab.name.slice(0, 15)}...`
                        : chatTab.name;
                    return open ? (
                      <div
                        key={chatTab?._id?.toString() as string}
                        className="w-full flex justify-center px-1"
                      >
                        <span
                          key={chatTab?._id?.toString() as string}
                          onClick={() => {
                            if (status === "ready") {
                              setSelectedChatTab(chatTab);
                            }
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
                      </div>
                    ) : (
                      <span
                        className={cn(
                          "rounded-full! flex flex-col items-center justify-center gap-2",
                          selectedChatTab?._id?.toString() ===
                            chatTab?._id?.toString() && "text-primary"
                        )}
                        key={chatTab?._id?.toString() as string}
                      >
                        <MessageCircleMore width={20} height={20} />
                      </span>
                    );
                  })}
                </div>
              )}
              {chatTabsLoading && (
                <div className="w-full flex flex-col items-center justify-center py-4">
                  <PulsatingLoader />
                </div>
              )}
            </div>
            {/* <div>
            <SidebarLink
              link={{
                label: "Manu Arora",
                href: "#",
                icon: (
                  <Image
                    src="https://assets.aceternity.com/manu.png"
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div> */}
          </SidebarBody>
        </Sidebar>
        <Chat
          selectedChatTab={selectedChatTab}
          setChatTabs={setChatTabs}
          setSelectedChatTab={setSelectedChatTab}
          messages={messages}
          sendMessage={sendMessage}
          stop={stop}
          status={status}
          setMessages={setMessages}
          error={error}
          chatTabs={chatTabs}
          handleNewChatCreate={handleNewChatCreate}
          chatTabsLoading={chatTabsLoading}
        />
      </div>
    </div>
  );
}

{
  /* Chat Component */
}
function Chat({
  selectedChatTab,
  setChatTabs,
  setSelectedChatTab,
  messages,
  sendMessage,
  stop,
  status,
  setMessages,
  error,
  chatTabs,
  handleNewChatCreate,
  chatTabsLoading,
}: ChatProps) {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0].value);
  const [reasoningOpened, setReasoningOpened] = useState<String[]>([]);
  const [isMessageOpen, setIsMessageOpen] = useState<String[]>([]);
  const [reasoning, setReasoning] = useState<boolean>(false);
  const [play] = useSound("/sounds/chat-completed-sound.mp3");
  console.log("error =", error);
  console.log("status =", status);
  console.log("messages =", messages);
  // console.log(user);

  // scrolling refs/state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastMsgRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [initialRender, setInitialRender] = useState<boolean>(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(true);
  const [chats, setChats] = useState<MessageWithAiModel[]>([]);
  console.log("initialRender =", initialRender);
  console.log("selectedModel =", selectedModel);

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

  // Ensure we start at the bottom on first mount or when messages change
  useEffect(() => {
    if (status !== "streaming" && status !== "submitted") {
      scrollToBottom(true);
    }
  }, [messages]);

  // Ensure we start at the bottom on first mount
  // useEffect(() => {
  //   scrollToBottom(true);
  // }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (messages.length >= 10) {
      handleNewChatCreate();
      return;
    }
    if (input.trim() && (status === "ready" || status === "error")) {
      sendMessage(
        { text: input },
        {
          body: {
            model: selectedModel,
            reasoning: models.find((model) => model.value === selectedModel)
              ?.isReasoningAvailable
              ? reasoning
              : false,
            provider: models.find((model) => model.value === selectedModel)
              ?.provider,
          },
        }
      );
      setInput("");
      // schedule a short scroll to the last attached message after DOM updates
      window.setTimeout(() => scrollToBottom(true), 40);
    }
  };

  // auto-scroll when messages change, but only if user is at bottom
  // useEffect(() => {
  //   if (!autoScroll) return;
  //   const el = containerRef.current;
  //   if (!el) return;
  //   if (rafRef.current) cancelAnimationFrame(rafRef.current);
  //   if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  //   timeoutRef.current = window.setTimeout(() => {
  //     rafRef.current = requestAnimationFrame(() => {
  //       try {
  //         el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  //       } catch {
  //         lastMsgRef.current?.scrollIntoView({
  //           behavior: "smooth",
  //           block: "end",
  //         });
  //       }
  //     });
  //   }, 60);
  //   return () => {
  //     if (rafRef.current) cancelAnimationFrame(rafRef.current);
  //     if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  //   };
  // }, [messages, autoScroll]);

  const handleStoreChat = async () => {
    try {
      console.log("inside handleStoreChat");
      if (status === "ready") {
        play();
      }
      if (
        status === "streaming" &&
        messages[messages.length - 1]?.role === "assistant"
      ) {
        setChats((curr) => [
          ...curr,
          {
            message: messages[messages.length - 2],
            ai_model: selectedModel,
          },
        ]);
        setChats((curr) => [
          ...curr,
          {
            message: messages[messages.length - 1],
            ai_model: selectedModel,
          },
        ]);
      }
      if (
        status === "ready" &&
        messages[messages.length - 1]?.role === "assistant" &&
        !initialRender
      ) {
        await axios.post("/api/chat/storeChat", {
          chatTab: selectedChatTab?._id?.toString() as string,
          message: messages[messages.length - 2],
          ai_model: selectedModel,
        });
        await axios.post("/api/chat/storeChat", {
          chatTab: selectedChatTab?._id?.toString() as string,
          message: messages[messages.length - 1],
          ai_model: selectedModel,
        });
        const name = messages[0].parts.filter((part) => part.type === "text")[0]
          .text;
        if (messages.length === 2) {
          const response = await axios.patch("/api/chat/updateChatTabName", {
            id: selectedChatTab?._id?.toString() as string,
            name,
          });
          setChatTabs((curr: ChatTabTypeSchema[]) =>
            curr.map((chatTab: ChatTabTypeSchema) =>
              chatTab._id?.toString() === response.data.data._id?.toString()
                ? (response.data.data as ChatTabTypeSchema)
                : (chatTab as ChatTabTypeSchema)
            )
          );
        }
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  };

  const handleGetCurrentMessagesByChatTabId = async () => {
    try {
      setIsMessagesLoading(true);
      const response = await axios.get(
        `/api/chat/getMessagesByChatTabId?chatTab=${
          selectedChatTab?._id?.toString() as string
        }`
      );
      setMessages(
        response.data.data.map((chat: ChatTypeSchema) => chat.message)
      );
      const openedMessages = response.data.data
        .slice()
        .map((chat: ChatTypeSchema) => chat.message.id);
      setIsMessageOpen(openedMessages);
      setChats(
        response.data.data.map((chat: ChatTypeSchema) => ({
          message: chat.message,
          ai_model: chat.ai_model,
        }))
      );
      console.log(
        response.data.data.map((chat: ChatTypeSchema) => chat.message)
      );
    } catch (error: any) {
      console.log(error.response.data.message);
      setMessages([]);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  useEffect(() => {
    handleStoreChat();
    // if (status === "ready") {
    //   handleNewChatCreate();
    // }
  }, [status]);

  useEffect(() => {
    if (!initialRender) {
      handleGetCurrentMessagesByChatTabId();
    }
    setInitialRender(false);
  }, [selectedChatTab]);

  // effect to open and close reasoning in real time
  useEffect(() => {
    // if thinking is streaming then display thinking(initially hidden)
    if (
      messages.length > 0 &&
      messages[messages.length - 1].parts.filter(
        (part) => part.type === "reasoning"
      )[0]?.state === "streaming"
    ) {
      if (!reasoningOpened.includes(messages[messages.length - 1].id)) {
        setReasoningOpened([
          ...reasoningOpened,
          messages[messages.length - 1].id,
        ]);
      }
    }

    // hide reasoning and message text if it was stopped abruptly
    for (const message of messages) {
      // reasoning part
      if (
        message.parts.filter((part) => part.type === "reasoning")[0]?.state ===
          "streaming" &&
        status === "ready"
      ) {
        setReasoningOpened(reasoningOpened.filter((id) => id !== message.id));
      }

      // message text part
      if (
        message.parts.filter((part) => part.type === "text")[0]?.state ===
          "streaming" &&
        status === "ready" &&
        !initialRender
      ) {
        setIsMessageOpen(isMessageOpen.filter((id) => id !== message.id));
      }
    }

    // if thinking is done the hide thinking
    if (
      messages.length > 0 &&
      messages[messages.length - 1].parts.filter(
        (part) => part.type === "reasoning"
      )[0]?.state === "done"
    ) {
      if (reasoningOpened.includes(messages[messages.length - 1].id)) {
        setReasoningOpened(
          reasoningOpened.filter(
            (id) => id !== messages[messages.length - 1].id
          )
        );
      }
    }

    // if message text is streaming then display message text(initially hidden)
    // for assistant message
    if (
      messages.length > 0 &&
      messages[messages.length - 1].parts.filter(
        (part) => part.type === "text"
      )[0]?.state === "streaming"
    ) {
      if (!isMessageOpen.includes(messages[messages.length - 1].id)) {
        setIsMessageOpen([...isMessageOpen, messages[messages.length - 1].id]);
      }
    }

    // for user message
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      if (!isMessageOpen.includes(messages[messages.length - 1].id)) {
        setIsMessageOpen([...isMessageOpen, messages[messages.length - 1].id]);
      }
    }
  }, [messages]);

  return (
    <div className="container mx-auto flex flex-col items-center w-full px-4 gap-8 pt-12 md:pt-4 min-h-screen scroll-smooth">
      {/* Spotlight */}
      <Spotlight className="fixed top-0 left-0" fill="#1c9cf0" />

      {/* Messages */}
      <div
        className={cn(
          "w-full bg-background border-mode rounded-lg p-4 md:p-6 card-shadow-no-hover min-h-screen scroll-smooth ",
          isMessagesLoading && "flex items-center justify-center"
        )}
      >
        {/* Messages */}
        {!isMessagesLoading ? (
          <div
            ref={containerRef}
            className={`w-full flex flex-col gap-3 scroll-smooth`}
          >
            {/* Suggestions */}
            {messages.length === 0 && input.trim() === "" && (
              <div className="w-full flex flex-col items-center justify-center py-4">
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
            {messages.map((message, i) => {
              const isReasoningAvailable =
                message.parts.filter((part) => part.type === "reasoning")
                  .length > 0 &&
                message.parts
                  .filter((part) => part.type === "reasoning")[0]
                  .text.trim() !== "";
              const ProviderIcon = models.find(
                (model) =>
                  model.value ===
                  chats.find((chat) => chat.message.id === message.id)?.ai_model
              )?.icon;
              return (
                <div
                  key={message.id}
                  ref={i === messages.length - 1 ? lastMsgRef : undefined}
                  className={`whitespace-pre-wrap p-3 rounded-md border-mode flex flex-col gap-2 ${
                    message.role === "user"
                      ? "bg-primary/5 ml-auto"
                      : "bg-background mr-auto"
                  }`}
                >
                  {/* Message Header */}
                  <section className="flex items-center gap-2">
                    {message.role === "user" ? (
                      user?.imageUrl ? (
                        <Image
                          src={user?.imageUrl}
                          alt="User"
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <User />
                      )
                    ) : ProviderIcon ? (
                      <ProviderIcon className="w-4 h-4 text-primary font-[900]" />
                    ) : (
                      <Brain className="w-4 h-4 text-primary font-[900]" />
                    )}
                    <span className="text-lg font-[900] text-primary mr-2">
                      {message.role === "user"
                        ? `${user?.fullName || "User"}`
                        : `${
                            models.find(
                              (model) =>
                                model.value ===
                                chats.find(
                                  (chat) => chat.message.id === message.id
                                )?.ai_model
                            )?.name || "AI"
                          }`}
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

                  {/* Loader while streaming indicating actual message or reasoning is still streaming */}
                  {message.role === "assistant" &&
                    (message.parts.filter((part) => part.type === "text")[0]
                      ?.state === "streaming" ||
                      message.parts.filter(
                        (part) => part.type === "reasoning"
                      )[0]?.state === "streaming") &&
                    status === "streaming" && (
                      <div className="w-full flex flex-col items-center justify-center py-4">
                        <PulsatingLoader />
                      </div>
                    )}

                  {/* Message Parts(Reasoning) */}
                  {isReasoningAvailable && (
                    <div className="w-full flex flex-col gap-2 text-muted-foreground mt-2">
                      <span className="text-sm font-bold flex justify-start items-center gap-2">
                        <Brain className="w-4 h-4" />
                        <p>
                          {message.parts.filter(
                            (part) => part.type === "reasoning"
                          )[0].state === "streaming"
                            ? "Thinking..."
                            : "Thinking Data"}
                        </p>
                        <Button
                          variant="outline"
                          className="w-4 h-4"
                          size="icon"
                          onClick={() => {
                            if (reasoningOpened.includes(message.id)) {
                              setReasoningOpened(
                                reasoningOpened.filter(
                                  (id) => id !== message.id
                                )
                              );
                            } else {
                              setReasoningOpened([
                                ...reasoningOpened,
                                message.id,
                              ]);
                            }
                          }}
                        >
                          {reasoningOpened.includes(message.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </span>

                      {reasoningOpened.includes(message.id) &&
                        message.parts
                          .filter((part) => part.type === "reasoning")
                          .map((part, i) => {
                            return (
                              <Response
                                key={`${message.id}-${i}`}
                                className="mt-1 leading-relaxed"
                              >
                                {part.text}
                              </Response>
                            );
                          })}
                    </div>
                  )}

                  {/* Show/Hide Messages Button */}
                  <span className="text-sm font-bold flex justify-start items-center gap-2 mt-2">
                    <MessageCircleMore className="w-4 h-4" />
                    <p>
                      {isMessageOpen.includes(message.id)
                        ? "Hide Message"
                        : "Show Message"}
                    </p>
                    <Button
                      variant="outline"
                      className="w-4 h-4"
                      size="icon"
                      onClick={() => {
                        if (isMessageOpen.includes(message.id)) {
                          setIsMessageOpen(
                            isMessageOpen.filter((id) => id !== message.id)
                          );
                        } else {
                          setIsMessageOpen([...isMessageOpen, message.id]);
                        }
                      }}
                    >
                      {isMessageOpen.includes(message.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </span>

                  {/* Message Parts(Reasoning) through AI SDK provided component */}
                  {/* {message.parts
                    .filter((part) => part.type === "reasoning")
                    .map((part, i) => {
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={status === "streaming"}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    })} */}

                  {/* Message Parts(Text) */}
                  {isMessageOpen.includes(message.id) &&
                    message.parts
                      .filter((part) => part.type === "text")
                      .map((part, i) => {
                        return (
                          <Response
                            key={`${message.id}-${i}`}
                            className="leading-relaxed p-2"
                          >
                            {part.text}
                          </Response>
                        );
                      })}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-4">
            <PulsatingLoader />
          </div>
        )}

        {/* Show loader while waiting for response to start streaming */}
        {status === "submitted" && (
          <div className="ml-2 flex items-center justify-start mt-6">
            <PulsatingLoader />
          </div>
        )}
      </div>

      {/* Chat Composer Input and Send Button */}
      <div className="mt-6 fixed bottom-1 left-0 right-0 flex justify-center items-center w-screen px-6 md:px-10">
        <form
          onSubmit={handleSubmit}
          className="container relative w-full flex flex-col justify-center items-center h-full bg-background rounded-xl shadow-lg border-2 border-border max-w-5xl"
        >
          {/* <Input
            className="p-6 rounded-xl bg-background! border-mode card-shadow-no-hover font-md container! w-full! disabled:opacity-100! border-2"
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.currentTarget.value)}
            disabled={status === "submitted" || status === "streaming"}
          /> */}

          <Textarea
            className="py-6 px-4 rounded-xl bg-background! border-mode font-md container! w-full! disabled:opacity-100! border-2 shadow-none! border-none! resize-none! ring-0! focus-visible:ring-0! focus-visible:ring-offset-0! focus-visible:outline-none! focus-visible:border-none! hover:outline-none! hover:ring-none! focus:outline-none! focus:ring-none! focus:ring-offset-none!"
            rows={1}
            style={{
              height: "scroll",
              minHeight: "60px",
              maxHeight: "200px",
            }}
            onKeyDown={(e) => {
              // Regular Enter will create new lines
              if (e.key === "Enter") {
                e.preventDefault();
                if (messages.length >= 10) {
                  handleNewChatCreate();
                  return;
                }
                if (
                  input.trim() &&
                  (status === "ready" || status === "error")
                ) {
                  sendMessage(
                    { text: input },
                    {
                      body: {
                        model: selectedModel,
                        reasoning: models.find(
                          (model) => model.value === selectedModel
                        )?.isReasoningAvailable
                          ? reasoning
                          : false,
                        provider: models.find(
                          (model) => model.value === selectedModel
                        )?.provider,
                      },
                    }
                  );
                  setInput("");
                  window.setTimeout(() => scrollToBottom(true), 40);
                }
              }
            }}
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.currentTarget.value)}
            disabled={status === "submitted" || status === "streaming"}
          />

          {/* Show spinner + Stop while waiting/streaming, otherwise Send button */}
          <div className="w-full flex flex-col sm:flex-row justify-end p-2 px-4 gap-4">
            {/* Select Model */}
            <div className="w-full flex flex-col sm:flex-row justify-start gap-2">
              <SelectModelForm
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
              />
              {models.find((model) => model.value === selectedModel)
                ?.isReasoningAvailable && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setReasoning((curr) => !curr);
                  }}
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full! sm:w-max! flex! justify-center! items-center! gap-2 px-3 py-1 text-sm rounded-md bg-background! text-foreground hover:scale-105 hover:text-foreground! transition-transform ease-in-out duration-300 cursor-pointer font-[900]! size-9",
                    reasoning && "bg-muted! text-primary hover:text-primary!",
                    "sm:w-10 sm:h-10"
                  )}
                >
                  <Brain
                    className={cn("w-4 h-4", reasoning && "text-primary")}
                  />
                  <p>Think</p>
                </Button>
              )}
            </div>

            {/* Send/Stop/Go-to-latest-message Buttons */}
            <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-2 justify-end items-end sm:items-center">
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

              {/* View All Chats button */}
              <ChatMenu
                chatTabs={chatTabs}
                setSelectedChatTab={setSelectedChatTab}
                selectedChatTab={selectedChatTab}
                handleNewChatCreate={handleNewChatCreate}
                chatTabsLoading={chatTabsLoading}
                status={status}
              />

              {/* Send/Stop button */}
              {status === "submitted" || status === "streaming" ? (
                <Button
                  type="submit"
                  variant="default"
                  onClick={() => stop()}
                  size="icon"
                  className="w-full sm:w-max rounded-md transition-transform hover:scale-105 px-2 py-4 bg-destructive/10 shadow-none border-1 border-destructive text-lg hover:bg-destructive/20!"
                >
                  <Ban className="h-6 w-6 text-destructive" />
                  <span className="sr-only">Stop</span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="default"
                  size="icon"
                  className="w-full sm:w-max rounded-md transition-transform hover:scale-105 p-2"
                >
                  <Send className="h-6 w-6" />
                  <span className="sr-only">Send</span>
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Bottom sentinel to ensure reliable scroll-to-bottom */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}

{
  /* Logo Component */
}
export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Acet Labs
      </motion.span>
    </Link>
  );
};

{
  /* Logo Icon Component */
}
export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
