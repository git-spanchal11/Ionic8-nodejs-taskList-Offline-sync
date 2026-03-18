import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginFormComponent } from '../../shared/components/login-form/login-form.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  imports: [CommonModule, IonicModule, LoginFormComponent]
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  errorMsg = '';

  /**
   * Processes the login submission and navigates to the task list upon success.
   */
  onLogin(credentials: {email: string, password: string}) {
    this.errorMsg = '';
    this.authService.login(credentials.email, credentials.password).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/tasks']);
        }
      },
      error: (err) => {
        this.errorMsg = err.message;
      }
    });
  }
}
