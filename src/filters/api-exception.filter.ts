import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';

export const formatLoggerMessage = (stack: any, message: string) => {
  const errorLines: string[] = stack?.split('\n')?.slice(1, 4);
  return `${message}\n${errorLines?.reduce(
    (prevV: string, curV: string, idx: number) =>
      prevV + `- ${curV?.trim()}${idx < errorLines.length - 1 ? '\n' : ''}`,
    '',
  )}\n`;
};

@Catch()
export class ApiExceptionsFilter implements ExceptionFilter {
  constructor(private logger: Logger) {}

  catch(exception: { status: number; message: string; stack: any }, host: ArgumentsHost) {
    // Format logger message
    const { status = 400, message, stack } = exception;

    // Format the error message
    const loggerMessage = formatLoggerMessage(stack, message);

    // Display error message
    if (status >= 500) this.logger.error(loggerMessage);
    else this.logger.warn(loggerMessage);

    const response = host.switchToHttp().getResponse();
    return response.status(status).send({
      statusCode: status,
      message,
    });
  }
}
