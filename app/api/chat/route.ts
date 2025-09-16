import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  smoothStream,
  streamText,
  UIMessage,
} from "ai";
import { NextRequest } from "next/server";

const openrouter = createOpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const {
    model,
    messages,
    reasoning,
    provider,
  }: {
    model: string;
    messages: UIMessage[];
    reasoning: boolean;
    provider: string;
  } = await req.json();

  // console.log("messages =", messages);
  console.log("reasoning =", reasoning);
  console.log("model =", model);

  const modelReceived =
    provider === "google"
      ? google.chat(model)
      : provider === "groq"
        ? groq(model)
        : openrouter.chat(model);
  console.log("modelReceived =", modelReceived);

  const result =
    provider !== "groq"
      ? streamText({
          model: modelReceived,
          messages: convertToModelMessages(messages),
          system: reasoning
            ? "Do NOT output step-by-step internal reasoning; return a concise final answer."
            : "Do output step-by-step internal reasoning; return a concise final answer.",
          // maxOutputTokens: 1000,
          // temperature: 0.3,
          // maxRetries: 3,
          providerOptions: {
            openrouter: {
              reasoning: {
                enabled: reasoning,
              },
              thinkingConfig: {
                includeThoughts: reasoning,
                includeThinking: reasoning,
              },
            },
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
            delayInMs: null, // optional: defaults to 10ms
            chunking: "word", // optional: defaults to 'word'
          }),
        })
      : reasoning
        ? streamText({
            model: modelReceived,
            messages: convertToModelMessages(messages),
            system: reasoning
              ? "Do NOT output step-by-step internal reasoning; return a concise final answer."
              : "Do output step-by-step internal reasoning; return a concise final answer.",
            providerOptions: {
              groq: {
                reasoningFormat: reasoning ? "parsed" : "hidden",
                reasoningEffort: "default",
              },
            },
          })
        : streamText({
            model: modelReceived,
            messages: convertToModelMessages(messages),
          });

  if (provider !== "groq") {
    return result.toUIMessageStreamResponse({
      sendReasoning: true,
    });
  } else {
    if (reasoning) {
      return result.toUIMessageStreamResponse({
        sendReasoning: true,
      });
    } else {
      return result.toUIMessageStreamResponse();
    }
  }
}
