import { groq } from "@ai-sdk/groq";
import { customProvider } from "ai";

const MODEL_ID = "meta-llama/llama-4-scout-17b-16e-instruct";

const languageModels = {
  [MODEL_ID]: groq(MODEL_ID),
};

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;
export const defaultModel: modelID = MODEL_ID;
