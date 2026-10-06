import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('ForgotPasswordComponent', () => {
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let component: ForgotPasswordComponent;
  const sendPasswordReset = vi.fn();

  beforeEach(async () => {
    sendPasswordReset.mockReset();

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [{ provide: AuthService, useValue: { sendPasswordReset } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
  });

  it('envía el enlace de recuperación y muestra la confirmación', async () => {
    sendPasswordReset.mockResolvedValue({ status: 'ok' });
    component.form.setValue({ email: 'ana@test.com' });

    await component.onSubmit();

    expect(sendPasswordReset).toHaveBeenCalledWith('ana@test.com');
    expect(component.sent()).toBe(true);
    expect(component.errorMsg()).toBe('');
  });

  it('muestra error si falla el envío', async () => {
    sendPasswordReset.mockResolvedValue({ status: 'error', message: 'Error' });
    component.form.setValue({ email: 'ana@test.com' });

    await component.onSubmit();

    expect(component.sent()).toBe(false);
    expect(component.errorMsg()).toContain('No se pudo enviar');
  });

  it('no envía si el email no es válido', async () => {
    component.form.setValue({ email: 'correo-malo' });

    await component.onSubmit();

    expect(component.form.get('email')?.touched).toBe(true);
    expect(sendPasswordReset).not.toHaveBeenCalled();
  });
});
