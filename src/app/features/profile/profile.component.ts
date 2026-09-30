import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { MessagesService } from '../../core/services/messages.service';
import { ToastService } from '../../core/services/toast.service';
import { Booking } from '../../core/models/booking.model';
import { ContactMessage } from '../../core/models/message.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  async ngOnInit() {
    await this.loadBookings();
    await this.loadMessages();
  }

  private async loadBookings() {
    const user = this.user();
    this.bookings.set(user ? await this.booking.userBookings(user.id) : []);
  }

  private async loadMessages() {
    const user = this.user();
    this.contactMessages.set(user ? await this.messages.userMessages(user.email, user.id) : []);
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
