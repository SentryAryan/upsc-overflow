"use client";

import { Reaction } from "@/convex/schema";
import { api } from "../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { Doc } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { cn } from "../../lib/utils";
type MessageWithReactionsProps = {
  text: string;
  messageId: Id<"messages">;
  isMessageByLoggedInUser: boolean;
};

type ReactionOption = {
  reaction: Reaction;
  count: number;
};

const reactionOptions: ReactionOption[] = [
  { reaction: Reaction.LIKE, count: 0 },
  { reaction: Reaction.LOVE, count: 0 },
  { reaction: Reaction.PARTY, count: 0 },
  { reaction: Reaction.LAUGH, count: 0 },
  { reaction: Reaction.WOW, count: 0 },
  { reaction: Reaction.SAD, count: 0 },
  { reaction: Reaction.ANGRY, count: 0 },
  { reaction: Reaction.SCARED, count: 0 },
  { reaction: Reaction.SURPRISED, count: 0 },
  { reaction: Reaction.CONFUSED, count: 0 },
  { reaction: Reaction.DISLIKE, count: 0 },
  { reaction: Reaction.BORED, count: 0 },
  { reaction: Reaction.TIRED, count: 0 },
  { reaction: Reaction.EXCITED, count: 0 },
  { reaction: Reaction.HUNDRED, count: 0 },
];

export function MessageWithReactions({
  text,
  messageId,
  isMessageByLoggedInUser,
}: MessageWithReactionsProps) {
  const { user } = useUser();
  const reactions = useQuery(api.tasks.getMessageReactions, {
    messageId,
  });
  const reactToMessage = useMutation(api.tasks.reactToMessage);
  const toggleReaction = useMutation(api.tasks.toggleReaction);
  const deleteReaction = useMutation(api.tasks.deleteReaction);

  // console.log("reactions =", reactions);

  function handleSelect(reaction: Reaction) {
    console.log("Inside handleSelect");
    // console.log("received reaction =", reaction);
    // console.log(
    //   "does reaction exist =",
    //   reactions?.some((r) => r.reaction === reaction && r.liker.id === user?.id)
    // );
    try {
      if (reactions?.some((r) => r.liker.id === user?.id)) {
        if (
          reactions?.some(
            (r) => r.reaction === reaction && r.liker.id === user?.id
          )
        ) {
          deleteReaction({
            reactionId: reactions?.filter(
              (r) => r.reaction === reaction && r.liker.id === user?.id
            )[0]._id,
          });
        } else {
          toggleReaction({
            reactionId: reactions?.filter((r) => r.liker.id === user?.id)[0]
              ._id,
            reaction: reaction,
          });
        }
      } else {
        reactToMessage({
          messageId,
          reaction: reaction,
          liker: {
            id: user?.id || "",
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            fullName: user?.fullName || "",
            imageUrl: user?.imageUrl || "",
          },
        });
      }
    } catch (error) {}
  }

  return (
    <div className="flex w-full justify-center">
      <div
        className={["inline-block w-full", "text-sm text-foreground"].join(" ")}
      >
        <p className="text-pretty">{text}</p>

        {/* Reactions row */}
        <div
          className="mt-2 flex flex-wrap items-center gap-1.5"
          aria-live="polite"
          aria-atomic="false"
        >
          {reactions?.map((reaction) => (
            <span
              key={reaction.reaction + reaction.liker.id}
              className={cn(
                "cursor-pointer inline-flex items-center gap-1 rounded-full",
                "bg-muted px-2 py-0.5 text-xs text-foreground/80 ring-1 ring-border",
                "transition-transform duration-200 ease-out"
                // bump ? "scale-110" : "scale-100",
              )}
              aria-label={`Click to remove reaction ${reaction.reaction}`}
              title={`${reaction.liker.id === user?.id ? "Click to remove reaction" : ""} ${reaction.reaction}`}
              onMouseDown={() => {
                if (reaction.liker.id === user?.id) {
                  handleSelect(reaction.reaction);
                }
              }}
            >
              <Image
                src={reaction.liker.imageUrl}
                alt={reaction.liker.fullName}
                className="rounded-full"
                width={16}
                height={16}
              />
              <span aria-hidden="true">{reaction.liker.fullName}</span>
              <span className="tabular-nums">{reaction.reaction}</span>
            </span>
          ))}
        </div>

        {/* Hover reaction chip (appears on hover/focus) */}
        <div
          className={cn(
            "pointer-events-none absolute -top-3 right-0 z-10",
            "translate-y-1 opacity-0",
            "transition-all duration-200 ease-out",
            "group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto",
            "focus-within:translate-y-0 focus-within:opacity-100 focus-within:pointer-events-auto w-max",
            !isMessageByLoggedInUser && "left-0"
          )}
        >
          <ReactionChip handleSelect={handleSelect} reactions={reactions} />
        </div>
      </div>
    </div>
  );
}

type ReactionChipProps = {
  className?: string;
  handleSelect: (reaction: Reaction) => void;
  reactions: Doc<"reactions">[] | undefined;
};

function ReactionChip({
  className = "",
  handleSelect,
  reactions,
}: ReactionChipProps) {
  const { user } = useUser();
  return (
    <div
      className={[
        "pointer-events-auto flex items-center gap-1 rounded-full",
        "bg-card/90 px-2 py-1 shadow-sm ring-1 ring-border backdrop-blur",
        "transition-shadow",
        className,
      ].join(" ")}
      role="group"
      aria-label="Add reaction"
    >
      {reactionOptions.map((r) => {
        return (
          <button
            key={r.reaction}
            type="button"
            onMouseDown={(evt) => handleSelect(r.reaction)}
            className={cn(
              "rounded-full p-1 text-base leading-none cursor-pointer",
              "transition-all duration-150 ease-out",
              "hover:scale-120 focus:scale-110 focus:outline-none hover:bg-primary/50",
              reactions?.some(
                (reaction) =>
                  reaction.reaction === r.reaction &&
                  reaction.liker.id === user?.id
              ) &&
                "scale-110 text-primary-foreground rounded-full bg-primary/50"
            )}
            aria-label={`${reactions?.some((reaction) => reaction.reaction === r.reaction && reaction.liker.id === user?.id) ? "Click to remove reaction" : "React with "} ${r.reaction}`}
            title={`${reactions?.some((reaction) => reaction.reaction === r.reaction && reaction.liker.id === user?.id) ? "Click to remove reaction" : "React with "} ${r.reaction}`}
          >
            {r.reaction}
          </button>
        );
      })}
    </div>
  );
}
