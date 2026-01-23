import { EQueueJob, EQueueName } from '@/common/enums';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import type { TExampleJobData } from '@/modules/bullmq/consumers';

@Injectable()
export class ExampleProducer {
  constructor(
    @InjectQueue(EQueueName.EXAMPLE_QUEUE)
    private queue: Queue,
  ) {}

  async addCheckoutCartItemsJob(payload: TExampleJobData): Promise<Job> {
    const { userId } = payload;

    // Add the checkoutCartItems job to the queue
    const checkoutCartItemsJob = await this.queue.add(
      EQueueJob.EXAMPLE_QUEUE_JOB,
      { userId },
      {
        jobId: `${EQueueJob.EXAMPLE_QUEUE_JOB}-${userId}-${new Date().getTime()}`,
        removeOnComplete: true,
      },
    );

    return checkoutCartItemsJob;
  }
}
