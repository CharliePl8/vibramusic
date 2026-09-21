import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { MessagesService } from '../../core/services/messages.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private booking = inject(BookingService);
  private messages = inject(MessagesService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly user = this.auth.currentUser;

  readonly bookings = computed(() => {
    const user = this.user();
    return user ? this.booking.userBookings(user.id) : [];
  });

  readonly contactMessages = computed(() => {
    const email = this.user()?.email;
    return email ? this.messages.userMessages(email) : [];
  });

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/']);
  }

  cancelBooking(id: string) {
    this.booking.cancel(id);
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
