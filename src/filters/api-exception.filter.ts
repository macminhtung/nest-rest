import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '@/common/constants';
import { QueryFailedError } from 'typeorm';

export const formatLoggerMessage = (stack: string, message: string) => {
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

  catch(exception: HttpException | QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    // CASE: QueryFailedError
    if (exception instanceof QueryFailedError) {
      const { query, parameters } = exception;

      // Display database error
      this.logger.error(`${query} - ${parameters}`);

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ERROR_MESSAGES.DATABASE_ERROR,
      });
    }

    // CASE: HttpException
    const { message, stack = '' } = exception;

    // Format the error message
    const loggerMessage = formatLoggerMessage(stack, message);

    // Display error message
    const status = exception.getStatus();
    if (status >= 500) this.logger.error(loggerMessage);
    else this.logger.warn(loggerMessage);

    return response.status(status).send({ statusCode: status, message });
  }
}
