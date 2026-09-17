import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
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
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly user = this.auth.currentUser;

  readonly bookings = computed(() => {
    const user = this.user();
    return user ? this.booking.userBookings(user.id) : [];
  });

  logout() {
    this.auth.logout();
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
}
