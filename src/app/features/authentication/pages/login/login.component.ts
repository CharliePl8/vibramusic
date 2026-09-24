import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  readonly loading = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.value;
    this.errorMsg.set('');
    this.loading.set(true);
    const result = await this.auth.login(email!, password!);
    this.loading.set(false);

    switch (result.status) {
      case 'ok':
        this.router.navigate(['/perfil']);
        break;
      case 'email-not-confirmed':
        this.errorMsg.set('Confirma tu correo antes de iniciar sesión.');
        break;
      case 'invalid-credentials':
        this.errorMsg.set('Email o contraseña incorrectos.');
        break;
      default:
        this.errorMsg.set('No se pudo iniciar sesión. Inténtalo de nuevo.');
    }
  }

  hasError(controlName: 'email' | 'password'): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && c.touched;
  }
}
