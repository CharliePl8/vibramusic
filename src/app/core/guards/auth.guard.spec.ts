import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

const route = {} as ActivatedRouteSnapshot;
const state = {} as RouterStateSnapshot;

describe('authGuard', () => {
  const ensureReady = vi.fn();
  const isAuthenticated = vi.fn();
  const createUrlTree = vi.fn();

  beforeEach(() => {
    ensureReady.mockReset().mockResolvedValue(undefined);
    isAuthenticated.mockReset();
    createUrlTree.mockReset().mockImplementation((commands: string[]) => ({ commands }));

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { ensureReady, isAuthenticated } },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });
  });

  it('permite el acceso si hay sesión', async () => {
    isAuthenticated.mockReturnValue(true);

    const result = await TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('redirige a /login si no hay sesión', async () => {
    isAuthenticated.mockReturnValue(false);

    const result = await TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(ensureReady).toHaveBeenCalled();
    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual({ commands: ['/login'] });
  });

  it('no cancela la navegación si ensureReady falla', async () => {
    ensureReady.mockRejectedValue(new Error('boom'));
    isAuthenticated.mockReturnValue(true);

    const result = await TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(result).toBe(true);
  });
});
