import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env' });

const {
  TYPEORM_TYPE,
  TYPEORM_HOST,
  TYPEORM_PORT,
  TYPEORM_USERNAME,
  TYPEORM_PASSWORD,
  TYPEORM_DATABASE,
  TYPEORM_SYNCHRONIZE,
  TYPEORM_DROP_SCHEMA,
  TYPEORM_ENTITIES,
  TYPEORM_MIGRATIONS,
  TYPEORM_MIGRATIONS_RUN,
} = process.env;

export const typeormConfig: DataSourceOptions & { debug: boolean } = {
  type: TYPEORM_TYPE as 'postgres',
  host: TYPEORM_HOST,
  port: Number(TYPEORM_PORT),
  username: TYPEORM_USERNAME,
  password: TYPEORM_PASSWORD,
  database: TYPEORM_DATABASE,
  synchronize: TYPEORM_SYNCHRONIZE === 'true', // Warning: Don't enable for production environment
  dropSchema: TYPEORM_DROP_SCHEMA === 'true', // Should only use for test environment
  entities: [TYPEORM_ENTITIES!],
  migrations: [TYPEORM_MIGRATIONS!],
  namingStrategy: new SnakeNamingStrategy(),
  migrationsRun: TYPEORM_MIGRATIONS_RUN === 'true',
  debug: true,
};

export default new DataSource(typeormConfig);
