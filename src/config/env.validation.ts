import * as Joi from 'joi';

export const ENV_VALIDATION = Joi.object({
  PORT: Joi.number().default(3000),
  // The README.md file mentions: Keep the .env.* files (No editing) ==> So I use the default value
  JWT_SECRET_KEY: Joi.string().default('DEFAULT_JWT_SECRET_KEY'),

  TYPEORM_TYPE: Joi.string().required(),
  TYPEORM_HOST: Joi.string().required(),
  TYPEORM_PORT: Joi.number().default(5432),
  TYPEORM_USERNAME: Joi.string().required(),
  TYPEORM_PASSWORD: Joi.string().required(),
  TYPEORM_DATABASE: Joi.string().required(),
  TYPEORM_SYNCHRONIZE: Joi.boolean().required(),
  TYPEORM_DROP_SCHEMA: Joi.boolean().required(),
  TYPEORM_ENTITIES: Joi.string().required(),
  TYPEORM_MIGRATIONS: Joi.string().required(),
});
