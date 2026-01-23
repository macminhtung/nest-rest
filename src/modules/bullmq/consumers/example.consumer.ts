import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { EQueueName } from '@/common/enums';

export type TExampleJobData = {
  userId: string;
};

@Injectable()
@Processor(EQueueName.EXAMPLE_QUEUE)
export class ExampleQueueConsumer extends WorkerHost {
  // eslint-disable-next-line @typescript-eslint/require-await
  async process(job: Job<TExampleJobData>) {
    job.log(`==> Job process ${job.id}`);
  }

  @OnWorkerEvent('active')
  onActive(job: Job<TExampleJobData>) {
    console.log('▶️ Job active:', job.id);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<TExampleJobData>) {
    console.log('✅ Job completed:', job.id);
  }

  @OnWorkerEvent('stalled')
  onStalled(job: Job<TExampleJobData>) {
    console.log('⚠️ Job stalled:', job.id);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<TExampleJobData>, err: Error) {
    console.error('❌ Job failed:', job.id, err.message);
  }
}
