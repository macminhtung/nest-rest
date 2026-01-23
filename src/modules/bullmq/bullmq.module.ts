import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EQueueName } from '@/common/enums';
import type { TEnvConfiguration } from '@/config';
import { ExampleProducer } from '@/modules/bullmq/producers/example.producer';

@Module({
  imports: [
    // #===============================#
    // # ==> BULL_MQ CONFIGURATION <== #
    // #===============================#
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<TEnvConfiguration>) => {
        const redisOptions = configService.get<TEnvConfiguration['redis']>('redis')!;
        return { connection: redisOptions };
      },
    }),

    BullModule.registerQueue({ name: EQueueName.EXAMPLE_QUEUE }),
  ],
  providers: [ExampleProducer],
  exports: [ExampleProducer],
})
export class BullMQModule {}
