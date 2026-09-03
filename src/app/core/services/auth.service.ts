import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';

const SESSION_KEY = 'vibra_session';
const USERS_KEY = 'vibra_users';
const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 minutos

interface StoredUser extends User {
  passwordHash: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<User | null>(null);

  constructor() {
    this.loadSession();
  }

  register(name: string, email: string, password: string): boolean {
    const users = this.getStoredUsers();
    if (users.some((u) => u.email === email)) {
      return false; // email ya registrado
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: this.hash(password),
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    this.createSession({ id: newUser.id, name: newUser.name, email: newUser.email });
    return true;
  }

  login(email: string, password: string): boolean {
    const users = this.getStoredUsers();
    const found = users.find(
      (u) => u.email === email && u.passwordHash === this.hash(password),
    );
    if (!found) return false;
    this.createSession({ id: found.id, name: found.name, email: found.email });
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    try {
      const session = JSON.parse(raw) as { user: User; expiresAt: number };
      if (Date.now() > session.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        this.currentUser.set(null);
        return false;
      }
      return true;
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
  }

  private createSession(user: User): void {
    const session = { user, expiresAt: Date.now() + SESSION_DURATION_MS };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.currentUser.set(user);
  }

  private loadSession(): void {
    if (this.isAuthenticated()) {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw) as { user: User; expiresAt: number };
        this.currentUser.set(session.user);
      }
    }
  }

  private getStoredUsers(): StoredUser[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as StoredUser[];
    } catch {
      return [];
    }
  }

  private hash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
    }
    return `h_${Math.abs(hash).toString(36)}`;
  }
}