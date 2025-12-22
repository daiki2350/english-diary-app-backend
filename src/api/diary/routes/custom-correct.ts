export default {
  routes: [
    {
      method: "POST",
      path: "/diaries/correct-and-save",
      handler: "diary.correctAndSave",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/diaries/monthly-word-count",
      handler: "diary.monthlyWordCount",
    },
    {
      method: "GET",
      path: "/diaries/weekly-level",
      handler: "diary.weeklyLevel",
    },
    {
      method: "GET",
      path: "/diaries/recent-grammar-issues",
      handler: "diary.recentGrammarIssues",
    },
    {
      method: "GET",
      path: "/diaries/calculate-streak",
      handler: "diary.calculateStreak",
    },
  ],
};
