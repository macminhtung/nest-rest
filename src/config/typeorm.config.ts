import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

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

dotenv.config({ path: NODE_ENV ? `.${NODE_ENV}.env` : '.env' });

export const typeormConfig: TypeOrmModuleOptions = {
  type: TYPEORM_TYPE as 'mariadb',
  host: TYPEORM_HOST,
  port: Number(TYPEORM_PORT),
  username: TYPEORM_USERNAME,
  password: TYPEORM_PASSWORD,
  database: TYPEORM_DATABASE,
  synchronize: NODE_ENV === 'production' ? false : Boolean(TYPEORM_SYNCHRONIZE), // Warning: Don't enable for production environment
  dropSchema: NODE_ENV === 'production' ? false : Boolean(TYPEORM_DROP_SCHEMA), // Should only use for test environment
  entities: [TYPEORM_ENTITIES!],
  migrations: [TYPEORM_MIGRATIONS!],
  namingStrategy: new SnakeNamingStrategy(),
  debug: true,
};

export default typeormConfig;
