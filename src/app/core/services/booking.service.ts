import { Injectable, signal } from '@angular/core';
import { Booking, StudioSlot } from '../models/booking.model';

const BOOKINGS_KEY = 'vibra_bookings';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly allBookings = signal<Booking[]>([]);

  constructor() {
    this.load();
  }

  userBookings(userId: string): Booking[] {
    return this.allBookings()
      .filter((b) => b.userId === userId)
      .sort((a, b) => a.date.localeCompare(b.date) || a.slot.localeCompare(b.slot));
  }

  isAvailable(date: string, slot: StudioSlot): boolean {
    return !this.allBookings().some((b) => b.date === date && b.slot === slot);
  }

  create(input: Omit<Booking, 'id' | 'createdAt'>): 'created' | 'conflict' {
    if (!this.isAvailable(input.date, input.slot)) {
      return 'conflict';
    }
    const booking: Booking = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const next = [...this.allBookings(), booking];
    this.allBookings.set(next);
    this.persist(next);
    return 'created';
  }

  cancel(id: string): void {
    const next = this.allBookings().filter((b) => b.id !== id);
    this.allBookings.set(next);
    this.persist(next);
  }

  private load(): void {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) return;
    try {
      this.allBookings.set(JSON.parse(raw) as Booking[]);
    } catch {
      // datos corruptos: se ignoran
    }
  }

  private persist(bookings: Booking[]): void {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }
}
