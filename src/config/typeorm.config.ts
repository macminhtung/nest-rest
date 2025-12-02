import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';
const isTs = __filename.endsWith('.ts');

dotenv.config({ path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env' });

const {
  NODE_ENV,
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
} = process.env;

export const typeormConfig: DataSourceOptions = {
  type: TYPEORM_TYPE as 'mariadb',
  host: TYPEORM_HOST,
  port: Number(TYPEORM_PORT),
  username: TYPEORM_USERNAME,
  password: TYPEORM_PASSWORD,
  database: TYPEORM_DATABASE,
  synchronize: NODE_ENV === 'production' ? false : Boolean(TYPEORM_SYNCHRONIZE), // Warning: Don't enable for production environment
  // synchronize: false,
  dropSchema: NODE_ENV === 'production' ? false : Boolean(TYPEORM_DROP_SCHEMA), // Should only use for test environment
  entities: [TYPEORM_ENTITIES!],
  migrations: [
    isTs
      ? `src/${TYPEORM_MIGRATIONS?.replace('{ts, js}', 'ts')}`
      : `dist/${TYPEORM_MIGRATIONS?.replace('{ts, js}', 'js')}`,
  ],
  namingStrategy: new SnakeNamingStrategy(),
  // migrationsRun: true,
  // debug: true,
};

export default new DataSource(typeormConfig);
