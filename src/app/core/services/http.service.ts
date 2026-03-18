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

  private checkNetwork(): boolean {
    if (!this.networkService.currentStatus) {
      return false;
    }
    return true;
  }

  get<T>(url: string, params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    if (!this.checkNetwork()) return throwError(() => new Error('Offline'));
    return this.http.get<T>(url, { params, headers });
  }

  post<T>(url: string, body: any | null, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    if (!this.checkNetwork()) return throwError(() => new Error('Offline'));
    return this.http.post<T>(url, body, { headers });
  }

  put<T>(url: string, body: any | null, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    if (!this.checkNetwork()) return throwError(() => new Error('Offline'));
    return this.http.put<T>(url, body, { headers });
  }

  patch<T>(url: string, body: any | null, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    if (!this.checkNetwork()) return throwError(() => new Error('Offline'));
    return this.http.patch<T>(url, body, { headers });
  }

  delete<T>(url: string, headers?: HttpHeaders | { [header: string]: string | string[] }): Observable<T> {
    if (!this.checkNetwork()) return throwError(() => new Error('Offline'));
    return this.http.delete<T>(url, { headers });
  }
}
