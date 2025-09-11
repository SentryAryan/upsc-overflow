import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { NextRequest } from "next/server";

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { model, messages }: { model: string; messages: UIMessage[] } =
    await req.json();
  const modelReceived = openrouter.chat(model);

  const result = streamText({
    model: modelReceived,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
