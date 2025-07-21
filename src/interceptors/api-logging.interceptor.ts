import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';

@Injectable()
export class APILoggingInterceptor implements NestInterceptor {
  constructor(private logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { ip, method, originalUrl } = request;
    this.logger.log(`==> REQUEST: ${ip} ${method} ${originalUrl}`);

    return next.handle();
  }
}
