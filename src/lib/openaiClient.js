const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure your .env has OPENAI_API_KEY
});

async function chatCompletion(messages) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // or gpt-4o-mini, etc.
    messages,
    max_tokens: 200,
    temperature: 0.0,
  });

  return response.choices[0].message.content;
}

module.exports = { chatCompletion };
