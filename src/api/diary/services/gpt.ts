// backend/src/api/diary/services/gpt.js
import OpenAI from "openai";

export default ({ strapi }) => ({
  async correct(content) {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "あなたは英語の日記を添削する専門家です。",
        },
        {
          role: "user",
          content: `次の日記を添削してください:\n${content}`,
        },
      ],
    });

    return {
      corrected: response.choices[0].message.content,
      tokens: response.usage.total_tokens,
    };
  }
});
