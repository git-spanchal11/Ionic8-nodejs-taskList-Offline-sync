import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    private networkService: NetworkService
  ) { }

  /**
   * Checks for network connectivity before initiating an HTTP request.
   */
  private checkNetwork(): boolean {
    if (!this.networkService.currentStatus) {
      return false;
    }
    return true;
  }

  /**
   * Performs an HTTP GET request with optional parameters and headers.
   */
  get<T>(url: string, params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    if (!this.checkNetwork()) return throwError(() => new Error('Offline'));
    return this.http.get<T>(url, { params, headers });
  }

  /**
   * Performs an HTTP POST request with a request body and optional headers.
   */
  post<T>(url: string, body: any | null, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    if (!this.checkNetwork()) return throwError(() => new Error('Offline'));
    return this.http.post<T>(url, body, { headers });
  }

  /**
   * Performs an HTTP PUT request with a request body and optional headers.
   */
  put<T>(url: string, body: any | null, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    if (!this.checkNetwork()) return throwError(() => new Error('Offline'));
    return this.http.put<T>(url, body, { headers });
  }

  /**
   * Performs an HTTP PATCH request with a request body and optional headers.
   */
  patch<T>(url: string, body: any | null, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    if (!this.checkNetwork()) return throwError(() => new Error('Offline'));
    return this.http.patch<T>(url, body, { headers });
  }

  /**
   * Performs an HTTP DELETE request with optional headers.
   */
  delete<T>(url: string, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    if (!this.checkNetwork()) return throwError(() => new Error('Offline'));
    return this.http.delete<T>(url, { headers });
  }
}
