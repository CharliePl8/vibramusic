import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  readonly errorMsg = signal('');
  readonly loading = signal(false);
  readonly sent = signal(false);

  constructor(private auth: AuthService) {}

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.value.email!;
    this.errorMsg.set('');
    this.loading.set(true);
    const result = await this.auth.sendPasswordReset(email);
    this.loading.set(false);

    if (result.status === 'ok') {
      this.sent.set(true);
      return;
    }
    this.errorMsg.set('No se pudo enviar el enlace. Inténtalo de nuevo.');
  }

  hasError(): boolean {
    const c = this.form.get('email');
    return !!c && c.invalid && c.touched;
  }
}
