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

    console.log("GPT result:", result);

    const saved = await strapi.documents("api::diary.diary").create({
      data: {
        content,
        corrected_content: result.corrected,
        grammar_issues: result.grammar_issues,
        feedback: result.feedback,
        tokens: result.tokens,
        date: new Date().toISOString(),
      },
    });

    return saved;
  }
}));


