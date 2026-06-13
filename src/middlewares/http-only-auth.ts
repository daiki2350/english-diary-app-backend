export default () => {
  return async (ctx, next) => {
    if (ctx.request.url.startsWith('/api') && ctx.cookies.get('Auth')) {
      const jwt = ctx.cookies.get('Auth')
      ctx.request.headers.authorization = `Bearer ${jwt}`
    }

    await next()

    if (ctx.request.url.startsWith('/api/auth')) {
      const jwt = ctx.response.body?.jwt

      console.log("secure", ctx.secure);
      console.log("protocol", ctx.protocol);
      console.log("forwarded", ctx.request.headers["x-forwarded-proto"]);

      if (jwt) {
        const isSecure =
          ctx.request.secure ||
          ctx.request.headers['x-forwarded-proto'] === 'https'

        ctx.cookies.set('Auth', jwt, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'none',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        })

        delete ctx.response.body.jwt
      }
    }
  }
}