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

function firstNonEmpty(...values: (string | null | undefined)[]): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return '';
}

function titleCase(value: string): string {
  return value
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

export function displayName(
  profileName?: string | null,
  metadataName?: string | null,
  email?: string | null,
): string {
  return (
    firstNonEmpty(profileName, metadataName) ||
    titleCase(firstNonEmpty(email).split('@')[0]) ||
    'Usuario'
  );
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly client = inject(SupabaseService).client;
  private readonly initPromise: Promise<void>;

  readonly currentUser = signal<User | null>(null);
  readonly ready = signal(false);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly passwordRecovery = signal(false);

  constructor() {
    this.client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session?.user) {
        this.passwordRecovery.set(true);
      }
      void this.applySession(session?.user ?? null);
    });
    this.initPromise = this.init();
  }

  async sendPasswordReset(email: string): Promise<AuthResult> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { status: 'error', message: error.message };
    }
    return { status: 'ok' };
  }

  async updatePassword(newPassword: string): Promise<AuthResult> {
    const { error } = await this.client.auth.updateUser({ password: newPassword });

    if (error) {
      return { status: 'error', message: error.message };
    }
    return { status: 'ok' };
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
    try {
      const { data } = await this.client.auth.getSession();
      await this.applySession(data.session?.user ?? null);
    } catch (error) {
      // Si la sesión no se puede restaurar, no dejamos la promesa pendiente ni
      // rechazada: el guard espera a ensureReady() y una promesa rota convertiría
      // cada navegación autenticada en un "no pasa nada" silencioso.
      console.error('No se pudo restaurar la sesión:', error);
    } finally {
      this.ready.set(true);
    }
  }

  private async applySession(authUser: SupabaseUser | null): Promise<void> {
    if (!authUser) {
      this.currentUser.set(null);
      return;
    }

    const profile = await this.fetchProfile(authUser.id);
    const email = profile?.email ?? authUser.email ?? '';
    this.currentUser.set({
      id: authUser.id,
      email,
      name: displayName(profile?.name, authUser.user_metadata?.['name'] as string, email),
      role: profile?.role ?? 'student',
    });
  }

  private async fetchProfile(id: string): Promise<ProfileRow | null> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('name,email,role')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('No se pudo cargar el perfil:', error.message);
        return null;
      }
      return (data as ProfileRow | null) ?? null;
    } catch (error) {
      console.error('No se pudo cargar el perfil:', error);
      return null;
    }
  }
}
