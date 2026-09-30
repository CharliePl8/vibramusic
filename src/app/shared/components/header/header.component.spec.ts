import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { computed, signal } from '@angular/core';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { User } from '../../../core/models/user.model';

const user: User = {
  id: 'u1',
  name: 'Ana Ruiz',
  email: 'ana@example.com',
  role: 'admin',
};

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([
          { path: '', children: [] },
          { path: 'perfil', children: [] },
          { path: 'admin', children: [] },
          { path: 'login', children: [] },
          { path: 'registro', children: [] },
        ]),
        {
          provide: AuthService,
          useValue: {
            currentUser: signal<User | null>(user),
            isAdmin: computed(() => true),
          },
        },
        { provide: ThemeService, useValue: { theme: signal<Theme>('light'), toggle: vi.fn() } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  function element(selector: string): HTMLElement {
    const found = fixture.nativeElement.querySelector(selector) as HTMLElement | null;
    expect(found).withContext(`no se encontró ${selector}`).toBeTruthy();
    return found!;
  }

  async function clickAndExpectUrl(selector: string, url: string): Promise<void> {
    element(selector).click();
    await fixture.whenStable();
    expect(router.url).toBe(url);
  }

  it('navega a Mi perfil al pulsar el usuario de la barra superior', async () => {
    await clickAndExpectUrl('.sticky-nav__user', '/perfil');
  });

  it('navega a Mi perfil al pulsar el avatar de la píldora flotante', async () => {
    await clickAndExpectUrl('.floating-auth__profile', '/perfil');
  });

  it('da nombre accesible a los dos controles de usuario', () => {
    expect(element('.sticky-nav__user').getAttribute('aria-label')).toBe('Mi perfil');
    expect(element('.floating-auth__profile').getAttribute('aria-label')).toBe('Mi perfil');
  });

  it('muestra la inicial y el nombre en la barra superior', () => {
    expect(element('.sticky-nav__user app-user-avatar .user-avatar').textContent.trim()).toBe('A');
    expect(element('.sticky-nav__user-name').textContent.trim()).toBe('Ana');
  });

  it('expone los dos controles como enlaces reales a /perfil', () => {
    expect(element('.sticky-nav__user').getAttribute('href')).toBe('/perfil');
    expect(element('.floating-auth__profile').getAttribute('href')).toBe('/perfil');
  });
});
