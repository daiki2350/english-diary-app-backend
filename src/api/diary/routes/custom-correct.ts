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
      path: "/diaries/monthly-level",
      handler: "diary.monthlyLevel",
    },
  ],
};
