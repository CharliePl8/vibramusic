import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

export interface ContactInfo {
  icon: string;
  value: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  readonly contactInfo: ContactInfo[] = [
    { icon: '📍', value: 'Calle de la Música, 12 — Carmona (Sevilla)' },
    { icon: '📞', value: '+34 910 123 456' },
    { icon: '✉️', value: 'hola@vibra.music' },
    { icon: '🕒', value: 'Lun–Vie 9–21h · Sáb–Dom 10–18h' },
  ];

  readonly sent = signal(false);

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // PMV: solo UI. Cuando haya backend se enviará a Firestore.
    this.form.reset();
    this.sent.set(true);
    setTimeout(() => this.sent.set(false), 4000);
  }

  hasError(controlName: 'name' | 'email' | 'message'): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && control.touched;
  }
}