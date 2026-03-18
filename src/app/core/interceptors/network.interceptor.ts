import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NetworkService } from '../services/network.service';

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {
  constructor(private networkService: NetworkService) {}

  /**
   * Blocks outgoing HTTP requests immediately if the network status is offline.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.networkService.currentStatus) {
      console.warn('NetworkInterceptor: Request blocked because offline.', request.url);
      return throwError(() => new Error('Offline'));
    }
    return next.handle(request);
  }
}
