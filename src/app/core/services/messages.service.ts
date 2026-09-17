import { Injectable, signal } from '@angular/core';
import { ContactMessage } from '../models/message.model';

const MESSAGES_KEY = 'vibra_messages';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly allMessages = signal<ContactMessage[]>([]);

  constructor() {
    this.load();
  }

  userMessages(email: string): ContactMessage[] {
    return this.allMessages()
      .filter((m) => m.email.toLowerCase() === email.toLowerCase())
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  add(input: { name: string; email: string; message: string }): void {
    const message: ContactMessage = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const next = [...this.allMessages(), message];
    this.allMessages.set(next);
    this.persist(next);
  }

  private load(): void {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) return;
    try {
      this.allMessages.set(JSON.parse(raw) as ContactMessage[]);
    } catch {
      // datos corruptos: se ignoran
    }
  }

  private persist(messages: ContactMessage[]): void {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }
}
