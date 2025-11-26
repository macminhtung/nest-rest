import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV ? `.${process.env.NODE_ENV}.env` : '.env' });

export const config: TypeOrmModuleOptions = {
  type: process.env.TYPEORM_TYPE as any,
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,

  synchronize: Boolean(process.env.TYPEORM_SYNCHRONIZE),
  dropSchema: Boolean(process.env.TYPEORM_DROP_SCHEMA),
  entities: [process.env.TYPEORM_ENTITIES!],
  migrations: [process.env.TYPEORM_MIGRATIONS!],
  namingStrategy: new SnakeNamingStrategy(),
  debug: true,
};

export default config;
