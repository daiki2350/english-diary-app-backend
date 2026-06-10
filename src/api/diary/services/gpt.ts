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
            7. issues の各要素には、"id" を必ず追加し、形式は "issue_{番号}" とする。番号は 1 から連番で振る。

            出力形式は必ず JSON とし、以下の形で返してください：

            {
              "corrected": "...添削後の英文...",
              "issues": [
                {
                  "id": "issue_1",
                  "type": "tense"
                    | "aspect"
                    | "modal_verb"
                    | "subject_verb_agreement"
                    | "voice_active_passive"
                    | "conditional"
                    | "comparative_superlative"
                    | "article"
                    | "preposition"
                    | "conjunction"
                    | "relative_clause"
                    | "infinitive_gerund"
                    | "plural_singular"
                    | "countable_uncountable"
                    | "determiner"
                    | "negation"
                    | "question_form"
                    | "word_order"
                    | "parallel_structure"
                    | "ellipsis_substitution"
                    | "quantifier"
                    | "word_choice"
                    | "collocation"
                    | "formality_tone"
                    | "register"
                    | "idiom_usage"
                    | "false_friends"
                    | "context_mismatch"
                    | "sentence_fragment"
                    | "run_on_sentence"
                    | "clause_misuse"
                    | "subordination_coordination"
                    | "coherence_cohesion"
                    | "punctuation"
                    | "capitalization"
                    | "spelling"
                    | "redundancy_wordiness"
                    | "ambiguity"
                    | "awkward_expression"
                    | "formality_mismatch",
                  "message": "何が間違っていて、どう直すべきかの説明",
                  "example_before": "間違っていた文",
                  "example_after": "修正後の文",
                }
              ],
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
    const grammarIssues = result.issues;
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

  async createDrill(issues, level) {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log(level)
    const label = issues.map((issue) => {
      return issue.label
    })

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `
            あなたは英語学習アプリの練習問題作成APIです。
            指定された弱点ジャンルに合わせて、英語の4択問題を作ってください。
            以下のタスクを厳密にこなしてください。

            1. 必ずJSONのみで返す
            2. Markdownは禁止
            3. choicesは必ず4つ
            4. answerはchoicesの中の1つでanswerが必ずchoiceにあることを確認してください
            5. questionには空欄を "___" で入れる。問題以外は何も返さないでください
            6. ジャンルは5つあり、各ジャンルから3問だす
            7. explanationは日本語で書く
            8. difficultyはCEFR形式で返す

            9. 各問題の "genre" は、必ず以下のリストの中の**1つだけ**を使うこと
            10. "genre" は配列ではなく**文字列で返すこと**
            11. 各問題はどのジャンルに属するか明確にすること
            12. CEFRレベル${level}以上の問題を作成すること

            ジャンル一覧:
            ${label}
            JSON形式:
            {
              "questions": [
                {
                  "id": "q_001",
                  "question": "問題文",
                  "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
                  "answer": "正解",
                  "genre": "前置詞"
                  "difficulty": "B1",
                  "hint": "ヒント",
                  "explanation": "解説"
                }
              ]
            }
          `
        },
        {
          role: 'user',
          content: `
            以下のジャンルから4択の練習問題を作成してください: \n${issues}
          `
        }
      ],
      response_format: { type: "json_object" }
    })

    const raw = response.choices[0].message.content

    const result = JSON.parse(raw);

    const questions = result.questions

    return questions
  }
});
