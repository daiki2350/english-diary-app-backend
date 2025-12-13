export default {
  async correctAndSave(ctx) {
    try {
      const { content } = ctx.request.body;

      if (!content) {
        return ctx.badRequest("Diary content is required");
      }

      // 1️⃣ Call GPT service
      const result = await strapi
        .service("api::diary.gpt")
        .correct(content);

      const { corrected, grammar_issues, feedback, tokens } = result;
      const date = new Date().toLocaleDateString()

      // 2️⃣ Save into Strapi DB
      const savedEntry = await strapi.entityService.create(
        "api::diary.diary",
        {
          data: {
            content,
            corrected,
            grammar_issues,
            feedback,
            tokens,
            date,
          },
        }
      );

      // 3️⃣ Return saved entry
      return savedEntry;

    } catch (err) {
      console.error(err);
      ctx.internalServerError("Something went wrong");
    }
  },
};
