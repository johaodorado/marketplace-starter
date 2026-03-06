export default () => ({
  app: {
    name: process.env.APP_NAME ?? 'marketplace-api',
    port: Number(process.env.PORT ?? 3000),
    nodeEnv: process.env.NODE_ENV ?? 'development'
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d'
  },
  database: {
    url: process.env.DATABASE_URL
  },
  redis: {
    url: process.env.REDIS_URL
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL
  }
})
