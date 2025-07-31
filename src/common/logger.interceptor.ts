import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, query } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - start;
        console.log(JSON.stringify({
          level: 'info',
          time: new Date().toJSON(),
          method,
          url,
          query,
          duration_ms: duration,
          status: data?.error?.code || 200,
        }));
      }),
    );
  }
}
