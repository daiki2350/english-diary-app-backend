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
  ],
};
