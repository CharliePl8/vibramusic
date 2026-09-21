import { Injectable, computed, inject, signal } from '@angular/core';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { User, UserRole } from '../models/user.model';

export type AuthResult =
  | { status: 'ok' }
  | { status: 'confirm-email' }
  | { status: 'email-in-use' }
  | { status: 'invalid-credentials' }
  | { status: 'email-not-confirmed' }
  | { status: 'error'; message: string };

interface ProfileRow {
  name: string;
  email: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly client = inject(SupabaseService).client;
  private readonly initPromise: Promise<void>;

  readonly currentUser = signal<User | null>(null);
  readonly ready = signal(false);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    this.client.auth.onAuthStateChange((_event, session) => {
      void this.applySession(session?.user ?? null);
    });
    this.initPromise = this.init();
  }

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return { status: 'email-in-use' };
      }
      return { status: 'error', message: error.message };
    }

    // Con la confirmación por email activa, un email ya registrado devuelve un
    // usuario "ofuscado" sin identidades en lugar de un error.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { status: 'email-in-use' };
    }

    if (!data.session) {
      return { status: 'confirm-email' };
    }

    await this.applySession(data.user);
    return { status: 'ok' };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes('email not confirmed')) {
        return { status: 'email-not-confirmed' };
      }
      if (message.includes('invalid login credentials')) {
        return { status: 'invalid-credentials' };
      }
      return { status: 'error', message: error.message };
    }

    await this.applySession(data.user);
    return { status: 'ok' };
  }

  async logout(): Promise<void> {
    await this.client.auth.signOut();
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  async ensureReady(): Promise<void> {
    await this.initPromise;
  }

  private async init(): Promise<void> {
    const { data } = await this.client.auth.getSession();
    await this.applySession(data.session?.user ?? null);
    this.ready.set(true);
  }

  private async applySession(authUser: SupabaseUser | null): Promise<void> {
    if (!authUser) {
      this.currentUser.set(null);
      return;
    }

    const profile = await this.fetchProfile(authUser.id);
    this.currentUser.set({
      id: authUser.id,
      email: profile?.email ?? authUser.email ?? '',
      name: profile?.name || (authUser.user_metadata?.['name'] as string) || '',
      role: profile?.role ?? 'student',
    });
  }

  private async fetchProfile(id: string): Promise<ProfileRow | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('name,email,role')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return data as ProfileRow;
  }
}
