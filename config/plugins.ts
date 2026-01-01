export default () => ({
    'strapi-v5-http-only-auth': {
    enabled: true,
    config: {
      // Default cookie settings
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
        domain: process.env.CLIENT_DOMAIN || 'localhost',
        path: '/',
      },
      // If set to true, the JWT will be removed from the response
      // after a successful login or registration
      deleteJwtFromResponse: true,
    },
  },
});
