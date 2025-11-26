import { Global, Module, Logger } from '@nestjs/common';
import { JwtService } from '@/modules/shared/services/jwt.service';

const SHARED_SERVICES = [JwtService, Logger];

@Global()
@Module({
  providers: SHARED_SERVICES,
  exports: SHARED_SERVICES,
})
export class SharedModule {}
