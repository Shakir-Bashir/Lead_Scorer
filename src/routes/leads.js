const OpenAI = require("openai");

// Initialize the client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Utility function to call Chat Completions
async function chatCompletion(
  messages,
  model = process.env.OPENAI_MODEL || "gpt-3.5-turbo"
) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing in environment variables");
  }

  const resp = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: 200,
    temperature: 0.0,
  });

  return resp.choices[0].message.content.trim();
}

module.exports = { chatCompletion };
