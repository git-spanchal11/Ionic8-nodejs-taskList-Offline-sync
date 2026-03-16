import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private staticEmail = 'sagar@gmail.com';
  private staticPassword = 'password@123';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  login(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        if (email === this.staticEmail && password === this.staticPassword) {
          this.isAuthenticatedSubject.next(true);
          observer.next(true);
        } else {
          observer.error(new Error('Invalid credentials'));
        }
        observer.complete();
      }, 1000); // Simulate network delay
    });
  }

  logout() {
    this.isAuthenticatedSubject.next(false);
  }

  get isAuthenticated() {
    return this.isAuthenticatedSubject.value;
  }
}
