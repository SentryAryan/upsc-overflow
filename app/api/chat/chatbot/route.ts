import { streamText, UIMessage, convertToModelMessages } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
    provider,
  }: {
    messages: UIMessage[];
    model: string;
    webSearch: boolean;
    provider: string;
  } = await req.json();

  const modelReceived =
    provider === "google"
      ? google.chat(model)
      : provider === "groq"
        ? groq(model)
        : openrouter.chat(model);
  console.log("modelReceived =", modelReceived);

  const result = streamText({
    model: modelReceived,
    messages: convertToModelMessages(messages),
    system:
      "You are a helpful assistant that can answer questions and help with tasks",
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
