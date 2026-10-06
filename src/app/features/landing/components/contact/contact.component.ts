import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessagesService } from '../../../../core/services/messages.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ContactDraftService } from '../../../../core/services/contact-draft.service';

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
  readonly sent = signal(false);
  readonly sending = signal(false);

  private messages = inject(MessagesService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private contactDraft = inject(ContactDraftService);

  readonly contactInfo: ContactInfo[] = [
    { icon: '📍', value: 'Calle de la Música, 12 — Carmona (Sevilla)' },
    { icon: '📞', value: '+34 910 123 456' },
    { icon: '✉️', value: 'support@vibramusicstudio.es' },
    { icon: '🕒', value: 'Lun–Vie 9–21h · Sáb–Dom 10–18h' },
  ];

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', [Validators.required]),
  });

  constructor() {
    // Mensaje que deja el botón de reservar de un curso.
    effect(() => {
      const draft = this.contactDraft.draft();
      if (draft) {
        this.form.patchValue({ message: draft.message });
      }
    });

    // Nombre y email de la sesión, solo si el visitante no los ha escrito.
    // Como `currentUser` es un signal, esto también salta cuando la sesión
    // llega de Supabase después de montar el formulario.
    effect(() => {
      const user = this.auth.currentUser();
      if (!user) return;
      const patch: { name?: string; email?: string } = {};
      if (!this.form.controls.name.value) patch.name = user.name;
      if (!this.form.controls.email.value) patch.email = user.email;
      if (patch.name || patch.email) {
        this.form.patchValue(patch);
      }
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Revisa los campos del formulario.');
      return;
    }

    const { name, email, message } = this.form.value;
    this.sending.set(true);
    const ok = await this.messages.create({
      name: name!,
      email: email!,
      message: message!,
      userId: this.auth.currentUser()?.id ?? null,
    });
    this.sending.set(false);

    if (!ok) {
      this.toast.error('No se pudo enviar el mensaje. Inténtalo de nuevo.');
      return;
    }

    this.form.reset();
    this.contactDraft.clear();
    this.sent.set(true);
    this.toast.success('Mensaje enviado. Te contactaremos pronto.');
    setTimeout(() => this.sent.set(false), 4000);
  }

  hasError(controlName: 'name' | 'email' | 'message'): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && control.touched;
  }
}
