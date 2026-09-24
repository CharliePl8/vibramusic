import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

const TOAST_ICON: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
})
export class ToastContainerComponent {
  private toast = inject(ToastService);

  readonly toasts = this.toast.toasts;

  icon(type: string): string {
    return TOAST_ICON[type] ?? TOAST_ICON['info'];
  }

  dismiss(id: number): void {
    this.toast.dismiss(id);
  }
}
