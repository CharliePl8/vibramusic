import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ADMIN_PAGE_SIZE, AdminBooking, AdminService } from '../../core/services/admin.service';
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

  readonly pageSize = ADMIN_PAGE_SIZE;
  readonly tab = signal<AdminTab>('bookings');
  readonly loading = signal(true);
  readonly bookings = signal<AdminBooking[]>([]);
  readonly messages = signal<ContactMessage[]>([]);

  readonly bookingPage = signal(0);
  readonly bookingTotal = signal(0);
  readonly messagePage = signal(0);
  readonly messageTotal = signal(0);
  readonly unreadTotal = signal(0);

  readonly unreadCount = computed(() => this.unreadTotal());
  readonly bookingPageCount = computed(() => this.pageCount(this.bookingTotal()));
  readonly messagePageCount = computed(() => this.pageCount(this.messageTotal()));
  readonly hasPrevBookings = computed(() => this.bookingPage() > 0);
  readonly hasNextBookings = computed(() => this.bookingPage() + 1 < this.bookingPageCount());
  readonly hasPrevMessages = computed(() => this.messagePage() > 0);
  readonly hasNextMessages = computed(() => this.messagePage() + 1 < this.messagePageCount());

  async ngOnInit() {
    await this.reload();
  }

  setTab(tab: AdminTab) {
    this.tab.set(tab);
  }

  private pageCount(total: number): number {
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  private async reload() {
    this.loading.set(true);
    await Promise.all([this.loadBookings(), this.loadMessages(), this.loadUnread()]);
    this.loading.set(false);
  }

  private async loadBookings() {
    const { rows, total } = await this.admin.bookings(this.bookingPage(), this.pageSize);
    this.bookings.set(rows);
    this.bookingTotal.set(total);
  }

  private async loadMessages() {
    const { rows, total } = await this.admin.messages(this.messagePage(), this.pageSize);
    this.messages.set(rows);
    this.messageTotal.set(total);
  }

  private async loadUnread() {
    this.unreadTotal.set(await this.admin.unreadMessages());
  }

  async goToBookingPage(page: number) {
    const target = Math.min(Math.max(page, 0), this.bookingPageCount() - 1);
    if (target === this.bookingPage()) return;
    this.bookingPage.set(target);
    await this.loadBookings();
  }

  async goToMessagePage(page: number) {
    const target = Math.min(Math.max(page, 0), this.messagePageCount() - 1);
    if (target === this.messagePage()) return;
    this.messagePage.set(target);
    await this.loadMessages();
  }

  async prevBookings() {
    await this.goToBookingPage(this.bookingPage() - 1);
  }

  async nextBookings() {
    await this.goToBookingPage(this.bookingPage() + 1);
  }

  async prevMessages() {
    await this.goToMessagePage(this.messagePage() - 1);
  }

  async nextMessages() {
    await this.goToMessagePage(this.messagePage() + 1);
  }

  async cancelBooking(id: string) {
    if (!(await this.admin.cancelBooking(id))) {
      this.toast.error('No se pudo cancelar la reserva.');
      return;
    }
    await this.loadBookings();
    if (this.bookings().length === 0 && this.bookingPage() > 0) {
      this.bookingPage.update((page) => page - 1);
      await this.loadBookings();
    }
    this.toast.success('Reserva cancelada.');
  }

  async toggleRead(message: ContactMessage) {
    const read = !message.read;
    if (!(await this.admin.setMessageRead(message.id, read))) {
      this.toast.error('No se pudo actualizar el mensaje.');
      return;
    }
    this.messages.update((list) => list.map((m) => (m.id === message.id ? { ...m, read } : m)));
    await this.loadUnread();
  }

  async deleteMessage(message: ContactMessage) {
    if (!window.confirm(`¿Eliminar el mensaje de ${message.name}?`)) return;
    if (!(await this.admin.deleteMessage(message.id))) {
      this.toast.error('No se pudo eliminar el mensaje.');
      return;
    }
    await this.loadMessages();
    await this.loadUnread();
    if (this.messages().length === 0 && this.messagePage() > 0) {
      this.messagePage.update((page) => page - 1);
      await this.loadMessages();
    }
    this.toast.success('Mensaje eliminado.');
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
