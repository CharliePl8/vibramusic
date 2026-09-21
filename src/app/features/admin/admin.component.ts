import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminBooking, AdminService } from '../../core/services/admin.service';
import { ContactMessage } from '../../core/models/message.model';
import { ToastService } from '../../core/services/toast.service';

type AdminTab = 'bookings' | 'messages';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private admin = inject(AdminService);
  private toast = inject(ToastService);

  readonly tab = signal<AdminTab>('bookings');
  readonly loading = signal(true);
  readonly bookings = signal<AdminBooking[]>([]);
  readonly messages = signal<ContactMessage[]>([]);

  readonly unreadCount = computed(() => this.messages().filter((m) => !m.read).length);

  async ngOnInit() {
    await this.reload();
  }

  private async reload() {
    this.loading.set(true);
    const [bookings, messages] = await Promise.all([this.admin.bookings(), this.admin.messages()]);
    this.bookings.set(bookings);
    this.messages.set(messages);
    this.loading.set(false);
  }

  async cancelBooking(id: string) {
    if (!(await this.admin.cancelBooking(id))) {
      this.toast.error('No se pudo cancelar la reserva.');
      return;
    }
    this.bookings.update((list) => list.filter((b) => b.id !== id));
    this.toast.success('Reserva cancelada.');
  }

  async toggleRead(message: ContactMessage) {
    const read = !message.read;
    if (!(await this.admin.setMessageRead(message.id, read))) {
      this.toast.error('No se pudo actualizar el mensaje.');
      return;
    }
    this.messages.update((list) => list.map((m) => (m.id === message.id ? { ...m, read } : m)));
  }

  formatDate(iso: string): string {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  formatTimestamp(ts: number): string {
    return new Date(ts).toLocaleString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
