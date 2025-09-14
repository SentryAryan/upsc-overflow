"use client";

import Chat from "@/components/conversations/Chat";
import PulsatingLoader from "@/components/Loaders/PulsatingLoader";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { usePaginatedQuery, UsePaginatedQueryReturnType } from "convex/react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type MessagesPaginatedReturnType = UsePaginatedQueryReturnType<
  typeof api.tasks.getConversationMessages
>;
export type MessageType = MessagesPaginatedReturnType["results"][0];
export type Status = MessagesPaginatedReturnType["status"];
export type LoadMore = MessagesPaginatedReturnType["loadMore"];
export type isLoading = MessagesPaginatedReturnType["isLoading"];

type ChatUser = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  imageUrl: string;
};

const ConversationPage = () => {
  const params = useParams();
  const { conversationId } = params;
  console.log("conversationId =", conversationId);
  const decodedConversationId = decodeURIComponent(conversationId as string);
  console.log("decodedConversationId =", decodedConversationId);
  const [isReceiverUserLoading, setIsReceiverUserLoading] =
    useState<boolean>(true);
  const { user } = useUser();
  const id = Array.isArray(conversationId)
    ? decodeURIComponent(conversationId[0] ?? "")
    : decodeURIComponent(conversationId ?? "");
  console.log("id =", id);
  const receiverId = id
    ?.split("::")
    .filter((userId: string) => userId !== user?.id)[0];
  console.log("receiverId =", receiverId);
  const [receiverUser, setReceiverUser] = useState<ChatUser | null>(null);
  const {
    results: messages,
    isLoading,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.tasks.getConversationMessages,
    {
      conversationId: decodedConversationId as string,
    },
    {
      initialNumItems: 5,
    }
  );
  console.log("messages =", messages);
  console.log("isLoading =", isLoading);
  console.log("status =", status);
  console.log("loadMore =", loadMore);

  const fetchReceiverUser = async () => {
    try {
      setIsReceiverUserLoading(true);
      const response = await axios.get(
        `/api/users/getUserById?userId=${encodeURIComponent(receiverId ?? "")}`
      );
      console.log("receiverUser =", response.data.data);
      setReceiverUser(response.data.data as ChatUser);
    } catch (error) {
      console.error("Failed to fetch receiver user");
    } finally {
      setIsReceiverUserLoading(false);
    }
  };

  useEffect(() => {
    fetchReceiverUser();
  }, [receiverId]);

  return (
    <div className="w-full flex flex-col items-center justify-center p-2">
      {isReceiverUserLoading ? (
        <div className="w-full min-h-screen bg-background border-border border-mode rounded-lg p-4 md:p-6 card-shadow-no-hover flex items-center justify-center">
          <PulsatingLoader />
        </div>
      ) : (
        <Chat
          sender={{
            id: user?.id ?? "",
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            fullName: user?.fullName ?? "",
            imageUrl: user?.imageUrl ?? "",
          }}
          receiver={{
            id: receiverUser?.id ?? "",
            firstName: receiverUser?.firstName ?? "",
            lastName: receiverUser?.lastName ?? "",
            fullName: `${receiverUser?.firstName ?? ""} ${receiverUser?.lastName ?? ""}`,
            imageUrl: receiverUser?.imageUrl ?? "",
          }}
          messages={messages.slice().reverse()}
          loadMore={loadMore}
          limit={5}
          status={status}
          isLoading={isLoading}
          isReceiverUserLoading={isReceiverUserLoading}
        />
      )}
    </div>
  );
};

export default ConversationPage;
