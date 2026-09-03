import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  readonly errorMsg = signal('');

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.value;
    const ok = this.auth.login(email!, password!);
    if (ok) {
      this.router.navigate(['/perfil']);
    } else {
      this.errorMsg.set('Email o contraseña incorrectos.');
    }
  }

  hasError(controlName: 'email' | 'password'): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && c.touched;
  }
}