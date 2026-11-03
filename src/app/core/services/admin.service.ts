import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Booking } from '../models/booking.model';
import { ContactMessage } from '../models/message.model';
import { BookingRow, mapBookingRow } from './booking.service';
import { MessageRow, mapMessageRow } from './messages.service';
import { todayIso } from '../utils/date';

export const ADMIN_PAGE_SIZE = 5;

export interface AdminBooking extends Booking {
  studentName: string;
  studentEmail: string;
}

export interface PagedAdminBookings {
  rows: AdminBooking[];
  total: number;
}

export interface PagedMessages {
  rows: ContactMessage[];
  total: number;
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly client = inject(SupabaseService).client;

  async bookings(page = 0, pageSize = ADMIN_PAGE_SIZE): Promise<PagedAdminBookings> {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await this.client
      .from('bookings')
      .select('*', { count: 'exact' })
      .gte('date', todayIso())
      .order('date', { ascending: true })
      .order('slot', { ascending: true })
      .range(from, to);

    if (error || !data) {
      return { rows: [], total: 0 };
    }

    const rows = data as BookingRow[];
    const profiles = await this.profilesByIds([...new Set(rows.map((r) => r.user_id))]);

    return {
      rows: rows.map((row) => {
        const booking = mapBookingRow(row);
        const profile = profiles[row.user_id];
        return {
          ...booking,
          studentName: profile?.name || '—',
          studentEmail: profile?.email || '—',
        };
      }),
      total: count ?? rows.length,
    };
  }

  async messages(page = 0, pageSize = ADMIN_PAGE_SIZE): Promise<PagedMessages> {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await this.client
      .from('messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error || !data) {
      return { rows: [], total: 0 };
    }

    const rows = data as MessageRow[];
    return { rows: rows.map((row) => mapMessageRow(row)), total: count ?? rows.length };
  }

  async unreadMessages(): Promise<number> {
    const { count, error } = await this.client
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('read', false);

    if (error) {
      console.error('No se pudo contar los mensajes sin leer:', error.message);
      return 0;
    }
    return count ?? 0;
  }

  async cancelBooking(id: string): Promise<boolean> {
    const { error } = await this.client.from('bookings').delete().eq('id', id);
    return !error;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const { error } = await this.client.from('messages').delete().eq('id', id);
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
