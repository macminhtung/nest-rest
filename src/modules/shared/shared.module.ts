import { Global, Module, Logger } from '@nestjs/common';
import { JwtService, AwsS3Service } from '@/modules/shared/services';

const SHARED_SERVICES = [Logger, JwtService, AwsS3Service];

@Global()
@Module({
  providers: SHARED_SERVICES,
  exports: SHARED_SERVICES,
})
export class SharedModule {}
