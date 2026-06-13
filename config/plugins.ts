export default ({ env }) => ({
    'strapi-v5-http-only-auth': {
    enabled: true,
    config: {
      // Default cookie settings
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'none',
        path: '/',
      },
      // If set to true, the JWT will be removed from the response
      // after a successful login or registration
      deleteJwtFromResponse: true,
    },
  },
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"), // Required
      },
      settings: {
        defaultFrom: env("SENDGRID_EMAIL"),
        defaultReplyTo: env("SENDGRID_EMAIL"),
      },
    },
  },
});

