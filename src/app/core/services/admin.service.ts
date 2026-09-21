import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Booking } from '../models/booking.model';
import { ContactMessage } from '../models/message.model';
import { BookingRow, mapBookingRow } from './booking.service';
import { MessageRow, mapMessageRow } from './messages.service';

export interface AdminBooking extends Booking {
  studentName: string;
  studentEmail: string;
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly client = inject(SupabaseService).client;

  async bookings(): Promise<AdminBooking[]> {
    const { data, error } = await this.client
      .from('bookings')
      .select('*')
      .order('date', { ascending: true })
      .order('slot', { ascending: true });

    if (error) {
      console.error('No se pudieron cargar las reservas:', error.message);
      return [];
    }

    const rows = data as BookingRow[];
    const profiles = await this.profilesByIds([...new Set(rows.map((r) => r.user_id))]);

    return rows.map((row) => {
      const booking = mapBookingRow(row);
      const profile = profiles[row.user_id];
      return {
        ...booking,
        studentName: profile?.name || '—',
        studentEmail: profile?.email || '—',
      };
    });
  }

  async messages(): Promise<ContactMessage[]> {
    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('No se pudieron cargar los mensajes:', error.message);
      return [];
    }
    return (data as MessageRow[]).map((row) => mapMessageRow(row));
  }

  async cancelBooking(id: string): Promise<boolean> {
    const { error } = await this.client.from('bookings').delete().eq('id', id);
    return !error;
  }

  async setMessageRead(id: string, read: boolean): Promise<boolean> {
    const { error } = await this.client.from('messages').update({ read }).eq('id', id);
    return !error;
  }

  private async profilesByIds(ids: string[]): Promise<Record<string, ProfileRow>> {
    if (ids.length === 0) return {};

    const { data, error } = await this.client
      .from('profiles')
      .select('id, name, email')
      .in('id', ids);
    if (error) {
      console.error('No se pudieron cargar los perfiles:', error.message);
      return {};
    }

    const map: Record<string, ProfileRow> = {};
    for (const profile of data as ProfileRow[]) {
      map[profile.id] = profile;
    }
    return map;
  }
}
