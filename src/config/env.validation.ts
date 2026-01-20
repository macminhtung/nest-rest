import * as Joi from 'joi';

export const ENV_VALIDATION = Joi.object({
  PROTOCOL: Joi.string().required(),
  PORT: Joi.number().default(3001),
  SOCKET_PORT: Joi.number().default(3002),
  DOMAIN: Joi.string().required(),
  JWT_SECRET_KEY: Joi.string().required(),
  APP_URI: Joi.string().required(),

  TYPEORM_HOST: Joi.string().required(),
  TYPEORM_PORT: Joi.number().required(),
  TYPEORM_USERNAME: Joi.string().required(),
  TYPEORM_PASSWORD: Joi.string().required(),
  TYPEORM_DATABASE: Joi.string().required(),
  TYPEORM_SYNCHRONIZE: Joi.boolean().required(),
  TYPEORM_MIGRATIONS_RUN: Joi.boolean().required(),
  TYPEORM_DEBUG: Joi.boolean().default(false),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_USERNAME: Joi.string().optional().allow('', null),
  REDIS_PASSWORD: Joi.string().optional().allow('', null),
  REDIS_TTL: Joi.number().default(600000), // ==> 10 minutes

  ELASTIC_NODE: Joi.string().required(),
  ELASTIC_USER: Joi.string().optional().allow('', null),
  ELASTIC_PASSWORD: Joi.string().optional().allow('', null),

  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_S3_BUCKET_NAME: Joi.string().required(),
});
