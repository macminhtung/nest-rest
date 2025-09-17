import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { MikroORMNamingStrategy } from '@/modules/mikro-orm/mikro-orm.naming';
import { MikroORMService } from '@/modules/mikro-orm/mikro-orm.service';
import type { TEnvConfiguration } from '@/config';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<TEnvConfiguration>) => {
        const { host, port, username, password, database } = configService.get('database')!;

        return {
          driver: PostgreSqlDriver,
          namingStrategy: MikroORMNamingStrategy,
          autoLoadEntities: true,
          migrations: { tableName: 'migrations', path: 'dist/migrations' },
          host,
          port,
          user: username,
          password,
          dbName: database,
          // debug: true,
        };
      },
    }),
  ],
  providers: [MikroORMService],
})
export class MikroORMModule {}
