import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  try {
    await auth.ensureReady();
  } catch {
    // Un guard que lanza cancela la navegación en silencio. Si la sesión no está
    // lista decidimos igualmente con el estado actual.
  }

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
