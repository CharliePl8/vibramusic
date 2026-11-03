import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { MessagesService } from '../../core/services/messages.service';
import { ToastService } from '../../core/services/toast.service';
import { Booking } from '../../core/models/booking.model';
import { ContactMessage } from '../../core/models/message.model';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, UserAvatarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private booking = inject(BookingService);
  private messages = inject(MessagesService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly user = this.auth.currentUser;
  readonly isAdmin = this.auth.isAdmin;
  readonly bookings = signal<Booking[]>([]);
  readonly contactMessages = signal<ContactMessage[]>([]);

  readonly pageSize = 10;
  readonly bookingPage = signal(0);
  readonly messagePage = signal(0);

  readonly pagedBookings = computed(() => this.pageSlice(this.bookings(), this.bookingPage()));
  readonly pagedMessages = computed(() =>
    this.pageSlice(this.contactMessages(), this.messagePage()),
  );
  readonly bookingPageCount = computed(() => this.pageCount(this.bookings().length));
  readonly messagePageCount = computed(() => this.pageCount(this.contactMessages().length));
  readonly hasPrevBookings = computed(() => this.bookingPage() > 0);
  readonly hasNextBookings = computed(() => this.bookingPage() + 1 < this.bookingPageCount());
  readonly hasPrevMessages = computed(() => this.messagePage() > 0);
  readonly hasNextMessages = computed(() => this.messagePage() + 1 < this.messagePageCount());

  async ngOnInit() {
    await this.loadBookings();
    await this.loadMessages();
  }

  private pageCount(total: number): number {
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  private pageSlice<T>(items: T[], page: number): T[] {
    const start = page * this.pageSize;
    return items.slice(start, start + this.pageSize);
  }

  private async loadBookings() {
    const user = this.user();
    this.bookings.set(user ? await this.booking.userBookings(user.id) : []);
    this.bookingPage.update((page) => Math.min(page, this.bookingPageCount() - 1));
  }

  private async loadMessages() {
    const user = this.user();
    this.contactMessages.set(user ? await this.messages.userMessages(user.email, user.id) : []);
    this.messagePage.update((page) => Math.min(page, this.messagePageCount() - 1));
  }

  async prevBookings() {
    this.bookingPage.update((page) => Math.max(0, page - 1));
  }

  async nextBookings() {
    if (this.hasNextBookings()) {
      this.bookingPage.update((page) => page + 1);
    }
  }

  async prevMessages() {
    this.messagePage.update((page) => Math.max(0, page - 1));
  }

  async nextMessages() {
    if (this.hasNextMessages()) {
      this.messagePage.update((page) => page + 1);
    }
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/']);
  }

  async cancelBooking(id: string) {
    const ok = await this.booking.cancel(id);
    if (!ok) {
      this.toast.error('No se pudo cancelar la reserva.');
      return;
    }
    await this.loadBookings();
    this.toast.success('Reserva cancelada.');
  }

  async deleteMessage(message: ContactMessage) {
    if (!window.confirm('¿Eliminar este mensaje?')) return;
    if (!(await this.messages.delete(message.id))) {
      this.toast.error('No se pudo eliminar el mensaje.');
      return;
    }
    await this.loadMessages();
    this.toast.success('Mensaje eliminado.');
  }

  formatDate(iso: string): string {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  formatTimestamp(ts: number): string {
    return new Date(ts).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
