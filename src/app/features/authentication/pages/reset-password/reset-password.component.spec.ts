import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

describe('ResetPasswordComponent', () => {
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let component: ResetPasswordComponent;
  const navigate = vi.fn();
  const router = {
    navigate,
    createUrlTree: vi.fn(() => null),
    serializeUrl: vi.fn(() => ''),
    events: { subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })) },
  };
  const toast = { success: vi.fn(), error: vi.fn(), info: vi.fn() };
  const auth = {
    ensureReady: vi.fn().mockResolvedValue(undefined),
    isAuthenticated: vi.fn().mockReturnValue(true),
    passwordRecovery: vi.fn().mockReturnValue(false),
    updatePassword: vi.fn(),
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    navigate.mockReset();
    toast.success.mockReset();
    auth.updatePassword.mockReset();
    auth.isAuthenticated.mockReturnValue(true);

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: ToastService, useValue: toast },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function initComponent() {
    const promise = component.ngOnInit();
    await vi.advanceTimersByTimeAsync(600);
    await promise;
  }

  it('muestra el formulario cuando llega una sesión de recuperación', async () => {
    await initComponent();

    expect(component.ready()).toBe(true);
    expect(component.invalid()).toBe(false);
  });

  it('muestra el enlace no válido sin sesión de recuperación', async () => {
    auth.isAuthenticated.mockReturnValue(false);

    await initComponent();

    expect(component.ready()).toBe(true);
    expect(component.invalid()).toBe(true);
  });

  it('actualiza la contraseña y navega a login', async () => {
    auth.updatePassword.mockResolvedValue({ status: 'ok' });
    component.form.setValue({ password: 'nueva1234', confirm: 'nueva1234' });

    await component.onSubmit();

    expect(auth.updatePassword).toHaveBeenCalledWith('nueva1234');
    expect(navigate).toHaveBeenCalledWith(['/login']);
    expect(toast.success).toHaveBeenCalled();
  });

  it('no envía si las contraseñas no coinciden', async () => {
    component.form.setValue({ password: 'nueva1234', confirm: 'distinta99' });

    await component.onSubmit();

    expect(component.errorMsg()).toBe('Las contraseñas no coinciden.');
    expect(auth.updatePassword).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
