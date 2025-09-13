import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { NextRequest } from "next/server";

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const {
    model,
    messages,
    reasoning,
  }: { model: string; messages: UIMessage[]; reasoning: boolean } =
    await req.json();

  // console.log("messages =", messages);
  console.log("reasoning =", reasoning);
  console.log("model =", model);

  const modelReceived = openrouter.chat(model);
  console.log("modelReceived =", modelReceived);

  const result = streamText({
    model: modelReceived,
    messages: convertToModelMessages(messages),
    providerOptions: {
      openrouter: {
        reasoning: {
          enabled: reasoning,
        },
      },
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
