/**
 * diary controller
 * export default factories.createCoreController(
  "api::diary.diary",
  ({ strapi }) => ({
    // カスタムアクション：GPT添削
    async correct(ctx) {
      const { content } = ctx.request.body;

      if (!content) {
        ctx.throw(400, "content is required");
      }

      const result = await strapi
        .service("api::diary.gpt")
        .correct(content);

      ctx.body = result;
    },
  })
);
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::diary.diary", ({ strapi }) => ({
  async correctAndSave(ctx) {
    const { content, word_count } = ctx.request.body;

    const result = await strapi
      .service("api::diary.gpt")
      .correct(content);


    const saved = await strapi.documents("api::diary.diary").create({
      data: {
        content,
        corrected_content: result.corrected,
        grammar_issues: result.grammar_issues,
        word_count,
        feedback: result.feedback,
        level: result.cefr,
        tokens_used: result.tokens,
        publishedAt: new Date(),
      },
    });

    return saved;
  },

  async monthlyWordCount(ctx) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0–11 → 今月

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const diaries = await strapi.entityService.findMany("api::diary.diary", {
      filters: {
        createdAt: {
          $gte: start,
          $lt: end,
        },
      },
      fields: ["word_count"],
    });

    const total = diaries.reduce(
      (sum, d) => sum + (d.word_count || 0),
      0
    );

    ctx.body = {
      month: `${year}-${String(month + 1).padStart(2, "0")}`,
      total,
    };
  },

  async monthlyLevel(ctx) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0–11 → 今月

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const diaries = await strapi.entityService.findMany("api::diary.diary", {
      filters: {
        createdAt: {
          $gte: start,
          $lt: end,
        },
      },
      fields: ["level"],
    });
    const levels = diaries.map((diary) => {
      switch(diary.level) {
        case 'A1':
          return 1;
        case 'A2':
          return 2;
        case 'B1':
          return 3;
        case 'B2':
          return 4;
        case 'C1':
          return 5;
        case 'C2':
          return 6;
      }
    }).filter((n) => n !== undefined);
    const avg = levels.reduce((sum, n) => sum + n, 0) / levels.length;
    const reverseLevelMap = {
      1: "A1",
      2: "A2",
      3: "B1",
      4: "B2",
      5: "C1",
      6: "C2",
    };

    const rounded = Math.round(avg);
    const avgLevel = reverseLevelMap[rounded];

    ctx.body = { level: avgLevel };
  }
}));





