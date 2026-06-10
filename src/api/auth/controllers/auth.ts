export default {
  async logout(ctx) {
    ctx.cookies.set("Auth", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.CLIENT_DOMAIN || 'localhost',
      expires: new Date(0), // ← 完全削除
      path: "/",
    });

    ctx.cookies.set("Auth.sig", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.CLIENT_DOMAIN || 'localhost',
      expires: new Date(0), // ← 完全削除
      path: "/",
    });

    ctx.cookies.set("jwtToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.CLIENT_DOMAIN || 'localhost',
      expires: new Date(0), // ← 完全削除
      path: "/",
    });

    console.log(ctx.request.headers.cookie);

    ctx.body = { ok: true };
  },
};