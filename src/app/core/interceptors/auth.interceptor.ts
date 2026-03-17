import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // We attach the mock token to every outgoing request explicitly to test the GCP function's auth layer
    const mockToken = 'mock-jwt-token-for-sagar';
    
    // Do not attach token to non-API URLs (e.g., local assets if there were any)
    if (request.url.startsWith('http')) {
      const cloned = request.clone({
        setHeaders: {
          Authorization: `Bearer ${mockToken}`
        }
      });
      return next.handle(cloned);
    }
    return next.handle(request);
  }
}
