import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

const DEFAULT_DURATION_MS = 4000;

let nextId = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: number): void {
    this.toasts.update((prev) => prev.filter((t) => t.id !== id));
  }

  private show(type: ToastType, message: string): void {
    const id = nextId++;
    this.toasts.update((prev) => [...prev, { id, type, message }]);
    setTimeout(() => this.dismiss(id), DEFAULT_DURATION_MS);
  }
}
