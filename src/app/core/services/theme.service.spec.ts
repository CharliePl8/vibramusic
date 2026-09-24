import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
    document.documentElement.removeAttribute('data-theme');
  });

  it('usa tema claro por defecto si no hay preferencia', () => {
    const service = new ThemeService();
    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('usa tema oscuro si el sistema lo prefiere', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    const service = new ThemeService();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('alterna entre claro y oscuro', () => {
    const service = new ThemeService();
    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    service.toggle();
    expect(service.theme()).toBe('light');
  });

  it('persiste el tema y lo restaura al recrear el servicio', () => {
    const first = new ThemeService();
    first.toggle();
    expect(localStorage.getItem('vibra_theme')).toBe('dark');

    const second = new ThemeService();
    expect(second.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
