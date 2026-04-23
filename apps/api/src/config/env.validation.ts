import * as Joi from 'joi'

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().default('marketplace-api'),
  JWT_SECRET: Joi.string().min(10).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),

  // Redis y RabbitMQ son opcionales — no se usan en el código actual
  REDIS_URL: Joi.string().optional().allow(''),
  RABBITMQ_URL: Joi.string().optional().allow(''),

  // Cloudinary opcional
  CLOUDINARY_CLOUD_NAME: Joi.string().optional().allow(''),
  CLOUDINARY_API_KEY: Joi.string().optional().allow(''),
  CLOUDINARY_API_SECRET: Joi.string().optional().allow(''),
})