import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly ready = signal(false);
  readonly invalid = signal(false);

  readonly form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirm: new FormControl('', [Validators.required]),
  });

  readonly errorMsg = signal('');
  readonly loading = signal(false);

  async ngOnInit() {
    await this.auth.ensureReady();
    // Pequeña espera para que supabase-js detecte la sesión del enlace de recuperación.
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!this.auth.isAuthenticated() && !this.auth.passwordRecovery()) {
      this.invalid.set(true);
    }
    this.ready.set(true);
  }

  async onSubmit() {
    const password = this.form.get('password')?.value;
    const confirm = this.form.get('confirm')?.value;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (password !== confirm) {
      this.form.get('confirm')?.markAsTouched();
      this.errorMsg.set('Las contraseñas no coinciden.');
      return;
    }

    this.errorMsg.set('');
    this.loading.set(true);
    const result = await this.auth.updatePassword(password!);
    this.loading.set(false);

    if (result.status === 'ok') {
      this.toast.success('Contraseña actualizada. Inicia sesión con tu nueva contraseña.');
      this.router.navigate(['/login']);
      return;
    }
    this.errorMsg.set('No se pudo actualizar la contraseña. Inténtalo de nuevo.');
  }

  hasError(controlName: 'password' | 'confirm'): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && c.touched;
  }
}
