export default {
  routes: [
    {
      method: "POST",
      path: "/diaries/correct-and-save",
      handler: "diary.correctAndSave",
      config: {
        auth: {},
      },
    },
    {
        method: "GET",
        path: "/diaries/get-lastdiary",
        handler: "diary.getLastDiary",
        config: {
            auth: {}
        }
    },
    {
      method: "GET",
      path: "/diaries/monthly-word-count",
      handler: "diary.monthlyWordCount",
      config: {
        auth: {},
      },
    },
    {
      method: "GET",
      path: "/diaries/weekly-level",
      handler: "diary.weeklyLevel",
      config: {
        auth: {},
      },
    },
    {
      method: "GET",
      path: "/diaries/recent-weekly-levels",
      handler: "diary.recentWeeklyLevels",
      config: {
        auth: {},
      },
    },
    {
      method: "GET",
      path: "/diaries/recent-grammar-issues",
      handler: "diary.recentGrammarIssues",
      config: {
        auth: {},
      },
    },
    {
      method: "GET",
      path: "/diaries/calculate-streak",
      handler: "diary.calculateStreak",
      config: {
        auth: {},
      },
    },
    {
      method: "GET",
      path: "/diaries/recent-grammar-issues-details",
      handler: "diary.recentGrammarIssuesDetails",
      config: {
        auth: {},
      },
    },
  ],
};
