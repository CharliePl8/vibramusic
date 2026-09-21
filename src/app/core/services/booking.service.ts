import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Booking, StudioService, StudioSlot } from '../models/booking.model';

interface BookingRow {
  id: string;
  user_id: string;
  date: string;
  slot: string;
  service: string;
  notes: string;
  created_at: string;
}

export type CreateBookingResult = 'created' | 'conflict' | 'error';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly client = inject(SupabaseService).client;

  async userBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await this.client
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('slot', { ascending: true });

    if (error || !data) return [];
    return (data as BookingRow[]).map((row) => this.toBooking(row));
  }

  async takenSlots(date: string): Promise<StudioSlot[]> {
    const { data, error } = await this.client.rpc('get_booked_slots', { p_date: date });
    if (error) {
      console.error('No se pudieron cargar las franjas ocupadas:', error.message);
      return [];
    }
    return (data ?? []).map((row: { slot: string }) => row.slot as StudioSlot);
  }

  async create(input: Omit<Booking, 'id' | 'createdAt'>): Promise<CreateBookingResult> {
    const { error } = await this.client.from('bookings').insert({
      user_id: input.userId,
      date: input.date,
      slot: input.slot,
      service: input.service,
      notes: input.notes,
    });

    if (error) {
      // 23505 = violación de la restricción única (date, slot)
      return error.code === '23505' ? 'conflict' : 'error';
    }
    return 'created';
  }

  async cancel(id: string): Promise<boolean> {
    const { error } = await this.client.from('bookings').delete().eq('id', id);
    return !error;
  }

  private toBooking(row: BookingRow): Booking {
    return {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      slot: row.slot as StudioSlot,
      service: row.service as StudioService,
      notes: row.notes,
      createdAt: new Date(row.created_at).getTime(),
    };
  }
}
