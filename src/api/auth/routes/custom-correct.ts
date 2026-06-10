export default {
  routes: [
    {
      method: "POST",
      path: "/auth/logout",
      handler: "auth.logout",
      config: {
        auth: false, // Cookie削除だけなのでOK
      },
    },
  ],
};