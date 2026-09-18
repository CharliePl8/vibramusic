import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let auth: AuthService;
  const navigate = vi.fn();

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate.mockReset();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: Router, useValue: { navigate } },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    auth = TestBed.inject(AuthService);
  });

  it('navega al perfil tras un login correcto', () => {
    auth.register('Ana', 'ana@test.com', 'secreto123');
    auth.logout();

    component.form.setValue({ email: 'ana@test.com', password: 'secreto123' });
    component.onSubmit();

    expect(navigate).toHaveBeenCalledWith(['/perfil']);
    expect(component.errorMsg()).toBe('');
  });

  it('muestra error con credenciales inválidas', () => {
    component.form.setValue({ email: 'ana@test.com', password: 'malaclave1' });
    component.onSubmit();

    expect(component.errorMsg()).toBe('Email o contraseña incorrectos.');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('no envía el formulario si es inválido', () => {
    component.form.setValue({ email: 'correo-malo', password: 'x' });
    component.onSubmit();

    expect(component.form.get('email')?.touched).toBe(true);
    expect(component.hasError('email')).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });
});
