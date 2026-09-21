import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  const navigate = vi.fn();
  const login = vi.fn();

  beforeEach(async () => {
    navigate.mockReset();
    login.mockReset();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: { login } },
        { provide: Router, useValue: { navigate } },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('navega al perfil tras un login correcto', async () => {
    login.mockResolvedValue({ status: 'ok' });
    component.form.setValue({ email: 'ana@test.com', password: 'secreto123' });

    await component.onSubmit();

    expect(login).toHaveBeenCalledWith('ana@test.com', 'secreto123');
    expect(navigate).toHaveBeenCalledWith(['/perfil']);
    expect(component.errorMsg()).toBe('');
  });

  it('muestra error con credenciales inválidas', async () => {
    login.mockResolvedValue({ status: 'invalid-credentials' });
    component.form.setValue({ email: 'ana@test.com', password: 'malaclave1' });

    await component.onSubmit();

    expect(component.errorMsg()).toBe('Email o contraseña incorrectos.');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('avisa si el correo no está confirmado', async () => {
    login.mockResolvedValue({ status: 'email-not-confirmed' });
    component.form.setValue({ email: 'ana@test.com', password: 'secreto123' });

    await component.onSubmit();

    expect(component.errorMsg()).toBe('Confirma tu correo antes de iniciar sesión.');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('no envía el formulario si es inválido', async () => {
    component.form.setValue({ email: 'correo-malo', password: 'x' });

    await component.onSubmit();

    expect(component.form.get('email')?.touched).toBe(true);
    expect(login).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
