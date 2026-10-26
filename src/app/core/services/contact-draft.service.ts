import { Injectable, signal } from '@angular/core';

export interface ContactDraft {
  message: string;
}

// Transporte entre secciones: el botón de reservar de un curso escribe aquí y
// el formulario de contacto lo aplica. Guarda un objeto y no un string para que
// pulsar dos veces el mismo curso vuelva a rellenar el formulario.
@Injectable({ providedIn: 'root' })
export class ContactDraftService {
  private readonly state = signal<ContactDraft | null>(null);
  readonly draft = this.state.asReadonly();

  setMessage(message: string): void {
    this.state.set({ message });
  }

  clear(): void {
    this.state.set(null);
  }
}