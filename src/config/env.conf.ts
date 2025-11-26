export const loadENVsFunc = () => ({
  port: process.env.PORT!,
  jwtSecretKey: process.env.JWT_SECRET_KEY!,
  database: {
    type: process.env.TYPEORM_TYPE!,
    host: process.env.TYPEORM_HOST!,
    port: +process.env.TYPEORM_PORT!,
    username: process.env.TYPEORM_USERNAME!,
    password: process.env.TYPEORM_PASSWORD!,
    database: process.env.TYPEORM_DATABASE!,
    synchronize: process.env.TYPEORM_SYNCHRONIZE!,
    dropSchema: process.env.TYPEORM_DROP_SCHEMA!,
    entities: [process.env.TYPEORM_ENTITIES],
    migrations: [process.env.TYPEORM_MIGRATIONS],
  },
});

export type TEnvConfiguration = ReturnType<typeof loadENVsFunc>;
