import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { anthropic, AnthropicProviderOptions } from "@ai-sdk/anthropic";
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
export const maxOutputTokens = 512;

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

  // Calculate the approximate word count based
  //on the token limit.
  const approximateWords = Math.floor(maxOutputTokens * 0.75);

  const modelReceived =
    provider === "google"
      ? google.chat(model)
      : provider === "groq"
        ? groq(model)
        : provider === "anthropic"
          ? anthropic(model)
          : openrouter.chat(model);
  console.log("modelReceived =", modelReceived);

  const system = `${
    reasoning ? "/think" : "/no_think"
  } , You are a helpful AI assistant. Please provide a short and concise response, keeping the total length to less than or equal to approximately ${approximateWords} words, this is a strict rule not to cross this word limit, frame answers accordingly, maintaining the response quality and length and balancing them perfectly. If you keep it shorter than limit, that would be even great, also keep in mind you are also generating thinking data words, so adjust accordingly. This ensures you can provide a complete answer without being cut off. Remember you donot have to always give exactly equal to max limit given, you can be much less also`;

  const result =
    provider !== "groq"
      ? streamText({
          model: modelReceived,
          messages: convertToModelMessages(messages),
          system: system,
          maxOutputTokens,
          temperature: 0.3,
          maxRetries: 3,
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
            anthropic: {
              thinking: {
                type: reasoning ? "enabled" : "disabled",
                budgetTokens: 12000,
              },
            } satisfies AnthropicProviderOptions,
          },
          experimental_transform: smoothStream({
            delayInMs: 50, // optional: defaults to 10ms
            chunking: "word", // optional: defaults to 'word'
          }),
        })
      : reasoning
        ? streamText({
            model: modelReceived,
            messages: convertToModelMessages(messages),
            system: system,
            maxOutputTokens,
            temperature: 0.3,
            maxRetries: 3,
            providerOptions: {
              groq: {
                reasoningFormat: reasoning ? "parsed" : "hidden",
                reasoningEffort: "default",
              },
            },
            experimental_transform: smoothStream({
              delayInMs: 50, // optional: defaults to 10ms
              chunking: "word", // optional: defaults to 'word'
            }),
          })
        : streamText({
            model: modelReceived,
            messages: convertToModelMessages(messages),
            system: system,
            maxOutputTokens,
            temperature: 0.3,
            maxRetries: 3,
            experimental_transform: smoothStream({
              delayInMs: 50, // optional: defaults to 10ms
              chunking: "word", // optional: defaults to 'word'
            }),
          });

  if (provider !== "groq") {
    return result.toUIMessageStreamResponse({
      sendReasoning: reasoning,
    });
  } else {
    if (reasoning) {
      return result.toUIMessageStreamResponse({
        sendReasoning: reasoning,
      });
    } else {
      return result.toUIMessageStreamResponse();
    }
  }
}
