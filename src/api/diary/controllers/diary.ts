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
    const { content } = ctx.request.body;

    const result = await strapi
      .service("api::diary.gpt")
      .correct(content);


    const saved = await strapi.documents("api::diary.diary").create({
      data: {
        content,
        corrected_content: result.corrected,
        grammar_issues: result.grammar_issues,
        feedback: result.feedback,
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
}));





