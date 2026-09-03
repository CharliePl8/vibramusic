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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
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
    const { name, email, password } = this.form.value;
    const ok = this.auth.register(name!, email!, password!);
    if (ok) {
      this.router.navigate(['/perfil']);
    } else {
      this.errorMsg.set('Este email ya está registrado.');
    }
  }

  hasError(controlName: 'name' | 'email' | 'password'): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && c.touched;
  }
}