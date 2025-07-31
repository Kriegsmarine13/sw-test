import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    let status = 500;
    let body: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      body = exception.getResponse();
    } else {
      body = {
        error: {
          code: 500,
          message: 'Internal server error',
        },
      };
    }

    Logger.error('Unhandled exception', exception);
    res.status(status).json({
      timestamp: new Date().toISOString(),
      path: req.url,
      ...body,
    });
  }
}
