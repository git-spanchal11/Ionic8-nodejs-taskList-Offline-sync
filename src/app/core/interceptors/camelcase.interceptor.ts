import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { camelCase, isArray, isObject, mapKeys, mapValues } from 'lodash';

@Injectable()
export class CamelCaseInterceptor implements HttpInterceptor {
  /**
   * Intercepts HTTP responses to convert snake_case body keys to camelCase.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse && event.body) {
          return event.clone({ body: this.toCamelCase(event.body) });
        }
        return event;
      })
    );
  }

  /**
   * Recursively converts all keys in an object or array to camelCase.
   */
  private toCamelCase(obj: any): any {
    if (isArray(obj)) {
      return obj.map(v => this.toCamelCase(v));
    } else if (isObject(obj) && obj !== null) {
      const camelCaseObj = mapKeys(obj, (v, k) => camelCase(k));
      return mapValues(camelCaseObj, (v) => this.toCamelCase(v));
    }
    return obj;
  }
}
