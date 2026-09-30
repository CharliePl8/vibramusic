import { TestBed } from '@angular/core/testing';
import { AuthService, displayName } from './auth.service';
import { SupabaseService } from './supabase.service';

interface ProfileRow {
  name: string;
  email: string;
  role: 'student' | 'admin';
}

function createMockClient() {
  return {
    auth: {
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  };
}

function mockProfileQuery(profile: ProfileRow | null) {
  return {
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: profile, error: null }),
      }),
    }),
  };
}

function authUser(id: string, email: string, name?: string) {
  return { id, email, user_metadata: name ? { name } : {}, identities: [{}] };
}

describe('AuthService', () => {
  let client: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    client = createMockClient();
    client.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    client.from.mockReturnValue(mockProfileQuery(null));

    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: { client } }],
    });
  });

  async function createService(): Promise<AuthService> {
    const service = TestBed.inject(AuthService);
    await service.ensureReady();
    return service;
  }

  it('restaura la sesión existente al arrancar', async () => {
    client.auth.getSession.mockResolvedValue({
      data: { session: { user: authUser('u9', 'bea@test.com') } },
      error: null,
    });
    client.from.mockReturnValue(
      mockProfileQuery({ name: 'Bea', email: 'bea@test.com', role: 'admin' }),
    );

    const service = await createService();

    expect(service.currentUser()?.name).toBe('Bea');
    expect(service.isAdmin()).toBe(true);
  });

  it('registra y pide confirmar el correo cuando no hay sesión', async () => {
    client.auth.signUp.mockResolvedValue({
      data: { user: authUser('u1', 'ana@test.com', 'Ana'), session: null },
      error: null,
    });

    const service = await createService();
    const result = await service.register('Ana', 'ana@test.com', 'secreto123');

    expect(result).toEqual({ status: 'confirm-email' });
    expect(service.currentUser()).toBeNull();
  });

  it('detecta un email ya registrado', async () => {
    client.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'ana@test.com', user_metadata: {}, identities: [] },
        session: null,
      },
      error: null,
    });

    const service = await createService();
    const result = await service.register('Ana', 'ana@test.com', 'secreto123');

    expect(result).toEqual({ status: 'email-in-use' });
  });

  it('registra con sesión activa cuando no hace falta confirmar', async () => {
    const user = authUser('u1', 'ana@test.com', 'Ana');
    client.auth.signUp.mockResolvedValue({ data: { user, session: { user } }, error: null });
    client.from.mockReturnValue(
      mockProfileQuery({ name: 'Ana', email: 'ana@test.com', role: 'student' }),
    );

    const service = await createService();
    const result = await service.register('Ana', 'ana@test.com', 'secreto123');

    expect(result).toEqual({ status: 'ok' });
    expect(service.currentUser()?.email).toBe('ana@test.com');
  });

  it('rechaza credenciales inválidas', async () => {
    client.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const service = await createService();
    const result = await service.login('ana@test.com', 'malaclave1');

    expect(result).toEqual({ status: 'invalid-credentials' });
  });

  it('avisa si el correo no está confirmado', async () => {
    client.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email not confirmed' },
    });

    const service = await createService();
    const result = await service.login('ana@test.com', 'secreto123');

    expect(result).toEqual({ status: 'email-not-confirmed' });
  });

  it('inicia sesión y carga el perfil', async () => {
    const user = authUser('u1', 'ana@test.com', 'Ana');
    client.auth.signInWithPassword.mockResolvedValue({
      data: { user, session: { user } },
      error: null,
    });
    client.from.mockReturnValue(
      mockProfileQuery({ name: 'Ana', email: 'ana@test.com', role: 'admin' }),
    );

    const service = await createService();
    const result = await service.login('ana@test.com', 'secreto123');

    expect(result).toEqual({ status: 'ok' });
    expect(service.currentUser()?.name).toBe('Ana');
    expect(service.isAdmin()).toBe(true);
  });

  it('cierra la sesión', async () => {
    const user = authUser('u1', 'ana@test.com', 'Ana');
    client.auth.signInWithPassword.mockResolvedValue({
      data: { user, session: { user } },
      error: null,
    });
    client.auth.signOut.mockResolvedValue({ error: null });

    const service = await createService();
    await service.login('ana@test.com', 'secreto123');
    await service.logout();

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('usa el email como nombre cuando el perfil no trae ninguno', async () => {
    client.auth.getSession.mockResolvedValue({
      data: { session: { user: authUser('u1', 'juan.perez_23@test.com') }, error: null },
    });
    client.from.mockReturnValue(
      mockProfileQuery({ name: '', email: 'juan.perez_23@test.com', role: 'student' }),
    );

    const service = await createService();

    expect(service.currentUser()?.name).toBe('Juan Perez 23');
  });

  it('sigue restorative la sesión aunque getSession falle', async () => {
    client.auth.getSession.mockRejectedValue(new Error('Failed to fetch'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const service = TestBed.inject(AuthService);

    await expect(service.ensureReady()).resolves.toBeUndefined();
    expect(service.ready()).toBe(true);
    expect(consoleError).toHaveBeenCalled();
  });
});

describe('displayName', () => {
  it('prioriza el nombre del perfil', () => {
    expect(displayName('Ana Ruiz', 'Otro', 'ana@test.com')).toBe('Ana Ruiz');
  });

  it('usa la metadata si el perfil está vacío', () => {
    expect(displayName('', 'Ana Ruiz', 'ana@test.com')).toBe('Ana Ruiz');
  });

  it('ignora nombres que solo son espacios', () => {
    expect(displayName('   ', '   ', 'ana.ruiz@test.com')).toBe('Ana Ruiz');
  });

  it('deriva el nombre del email cuando no hay ninguno', () => {
    expect(displayName(null, null, 'juan.perez_23@test.com')).toBe('Juan Perez 23');
  });

  it('cae a Usuario si no hay nada', () => {
    expect(displayName(null, null, null)).toBe('Usuario');
  });
});
