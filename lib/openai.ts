import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey:
    "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",
});

export const openai = new OpenAIApi(configuration);
