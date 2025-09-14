import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  smoothStream,
  streamText,
  UIMessage,
  convertToModelMessages,
} from "ai";
import { NextRequest } from "next/server";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

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

  const modelReceived = google.chat(model);
  console.log("modelReceived =", modelReceived);

  const result = streamText({
    model: modelReceived,
    messages: convertToModelMessages(messages),
    system: reasoning
      ? "Do NOT output step-by-step internal reasoning; return a concise final answer."
      : "Do output step-by-step internal reasoning; return a concise final answer.",
    providerOptions: {
      google: {
        reasoning: {
          enabled: reasoning,
        },
        thinkingConfig: {
          includeThoughts: reasoning,
          includeThinking: reasoning,
        },
      },
    },
    experimental_transform: smoothStream({
      delayInMs: 50, // optional: defaults to 10ms
      chunking: "word", // optional: defaults to 'word'
    }),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
