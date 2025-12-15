import OpenAI from "openai";

export default ({ strapi }) => ({
  async correct(content) {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    {/*const response = await client.responses.create({
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
    */}

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
            あなたはネイティブの英語講師であり、IELTS と CEFR の採点基準に精通したプロの英語添削者です。
            以下のタスクを厳密にこなしてください。

            1. 文法ミス・語法ミスを正確に修正し、自然で洗練された英語に書き換えてください。
            2. 文章の意味が変わらない範囲でよりネイティブらしい表現に改善してください。
            3. IELTS Writing の観点（Task response, Coherence, Lexical resource, Grammar range）で弱点を指摘してください。
            4. 文法ミスは「どこが」「なぜ間違いか」を日本語で詳しく説明してください。
            5. 最後に CEFR レベル（推定）を出し、理由を説明してください。
            6. 説明やフィードバックは全て日本語にしてください。

            出力形式は必ず JSON とし、以下の形で返してください：

            {
              "corrected": "...添削後の英文...",
              "grammar_issues": ["...文法の問題...", "...理由つきで複数..."],
              "feedback": "...総合アドバイス...",
              "ielts_estimate": "5.5 ~ 6.0",
              "cefr_estimate": "B1"
            }
          `,
        },
        {
          role: "user",
          content: `以下の日記を添削してください：\n${content}`,
        },
      ],
      response_format: { type: "json_object" }
    });



    // ① 返ってきた JSON文字列を取得
    const raw = response.choices[0].message.content;

    // ② JSONとして扱える形へパース
    const result = JSON.parse(raw);

    // ③ 必要な値を取り出す
    const corrected = result.corrected;
    const grammarIssues = result.grammar_issues;
    const feedback = result.feedback;
    const ielts = result.ielts_estimate;
    const cefr = result.cefr_estimate;

    return {
      corrected: corrected,
      grammar_issues: grammarIssues,
      feedback: feedback,
      cefr: cefr,
      tokens: response.usage.total_tokens,
    };
  },
});
