import OpenAI from "openai";

export default ({ strapi }) => ({
  async correct(content) {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: `
        Return ONLY valid JSON:

        {
          "corrected": "<corrected English text>",
          "grammar_issues": ["<日本語で短く説明>", "<日本語で短く説明>"],
          "feedback": "<気をつけるポイントや良かった点などを日本語で説明>",
        }

        Rules:
          - JSON 以外を書かない
          - 不要な文章やmarkdownや---を出さない
        User text:
          ${content}`,
    });

    // ← ここが最新の正しいアクセス方法！
    const text = response.output_text

    const json = JSON.parse(text);

    return {
      corrected: json.corrected,
      grammar_issues: json.grammar_issues,
      feedback: json.feedback,
      tokens: response.usage.total_tokens,
    };
  },
});
