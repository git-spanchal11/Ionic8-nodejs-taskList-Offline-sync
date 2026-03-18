import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * AuthService handles mock authentication logic.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private staticEmail = 'sagar@gmail.com';
  private staticPassword = 'password@123';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /**
   * Handles user login with static credentials and simulates a network delay.
   */
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

  /**
   * Clears the current authentication state.
   */
  logout() {
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Returns the current authentication status.
   */
  get isAuthenticated() {
    return this.isAuthenticatedSubject.value;
  }
}
