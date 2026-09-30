import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

const route = {} as ActivatedRouteSnapshot;
const state = {} as RouterStateSnapshot;

describe('adminGuard', () => {
  const ensureReady = vi.fn();
  const isAdmin = vi.fn();
  const createUrlTree = vi.fn();

  beforeEach(() => {
    ensureReady.mockReset().mockResolvedValue(undefined);
    isAdmin.mockReset();
    createUrlTree.mockReset().mockImplementation((commands: string[]) => ({ commands }));

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { ensureReady, isAdmin } },
        { provide: Router, useValue: { createUrlTree } },
      ],
    });
  });

  it('permite el acceso a un administrador', async () => {
    isAdmin.mockReturnValue(true);

    const result = await TestBed.runInInjectionContext(() => adminGuard(route, state));

    expect(result).toBe(true);
    expect(createUrlTree).not.toHaveBeenCalled();
  });

  it('redirige a la portada si no es administrador', async () => {
    isAdmin.mockReturnValue(false);

    const result = await TestBed.runInInjectionContext(() => adminGuard(route, state));

    expect(createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toEqual({ commands: ['/'] });
  });

  it('no cancela la navegación si ensureReady falla', async () => {
    ensureReady.mockRejectedValue(new Error('boom'));
    isAdmin.mockReturnValue(true);

    const result = await TestBed.runInInjectionContext(() => adminGuard(route, state));

    expect(result).toBe(true);
  });
});
