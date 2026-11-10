import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ContactMessage } from '../models/message.model';

export interface MessageRow {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function mapMessageRow(row: MessageRow): ContactMessage {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    message: row.message,
    read: row.read,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export interface NewContactMessage {
  name: string;
  email: string;
  message: string;
  userId?: string | null;
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly client = inject(SupabaseService).client;

  async userMessages(email: string, userId?: string | null): Promise<ContactMessage[]> {
    // Dos consultas separadas (por user_id y por email) en lugar de un `.or()`
    // con el email interpolado: evita inyección de filtros PostgREST.
    const requests = [
      this.client
        .from('messages')
        .select('*')
        .ilike('email', escapeLikePattern(email))
        .order('created_at', { ascending: false }),
    ];

    if (userId) {
      requests.push(
        this.client
          .from('messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      );
    }

    const results = await Promise.all(requests);
    const byId = new Map<string, ContactMessage>();
    let errorMessage: string | null = null;

    for (const { data, error } of results) {
      if (error) {
        errorMessage ??= error.message;
        continue;
      }
      for (const row of (data as MessageRow[] | null) ?? []) {
        byId.set(row.id, mapMessageRow(row));
      }
    }

    if (errorMessage) {
      console.error('No se pudieron cargar los mensajes:', errorMessage);
    }

    return [...byId.values()].sort((a, b) => b.createdAt - a.createdAt);
  }

  async allMessages(): Promise<ContactMessage[]> {
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

  async setRead(id: string, read: boolean): Promise<boolean> {
    const { error } = await this.client.from('messages').update({ read }).eq('id', id);
    if (error) {
      console.error('No se pudo actualizar el mensaje:', error.message);
      return false;
    }
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client.from('messages').delete().eq('id', id);
    if (error) {
      console.error('No se pudo eliminar el mensaje:', error.message);
      return false;
    }
    return true;
  }

  async create(input: NewContactMessage): Promise<boolean> {
    const { error } = await this.client.from('messages').insert({
      user_id: input.userId ?? null,
      name: input.name,
      email: input.email,
      message: input.message,
    });

    if (error) {
      console.error('No se pudo enviar el mensaje:', error.message);
      return false;
    }
    return true;
  }
}
