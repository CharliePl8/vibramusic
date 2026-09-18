import { AuthService } from './auth.service';
import { User } from '../models/user.model';

const SESSION_KEY = 'vibra_session';
const USERS_KEY = 'vibra_users';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    service = new AuthService();
  });

  it('registra un usuario y abre sesión', () => {
    const ok = service.register('Ana', 'ana@test.com', 'secreto123');
    expect(ok).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.name).toBe('Ana');
    expect(service.currentUser()?.email).toBe('ana@test.com');
  });

  it('no permite registrar un email ya existente', () => {
    service.register('Ana', 'ana@test.com', 'secreto123');
    service.logout();
    const ok = service.register('Otra', 'ana@test.com', 'otraclave1');
    expect(ok).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('inicia sesión con credenciales correctas', () => {
    service.register('Ana', 'ana@test.com', 'secreto123');
    service.logout();
    expect(service.login('ana@test.com', 'secreto123')).toBe(true);
    expect(service.currentUser()?.name).toBe('Ana');
  });

  it('rechaza una contraseña incorrecta', () => {
    service.register('Ana', 'ana@test.com', 'secreto123');
    service.logout();
    expect(service.login('ana@test.com', 'malaclave1')).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('cierra la sesión', () => {
    service.register('Ana', 'ana@test.com', 'secreto123');
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('expira la sesión pasados los 10 minutos', () => {
    service.register('Ana', 'ana@test.com', 'secreto123');
    const raw = sessionStorage.getItem(SESSION_KEY);
    expect(raw).toBeTruthy();
    const session = JSON.parse(raw!) as { user: User; expiresAt: number };
    session.expiresAt = Date.now() - 1000;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
