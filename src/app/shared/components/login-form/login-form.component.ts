import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginFormComponent {
  @Output() loginSubmit = new EventEmitter<{email: string, password: string}>();
  
  credentials = { email: '', password: '' };

  onSubmit() {
    this.loginSubmit.emit(this.credentials);
  }
}
