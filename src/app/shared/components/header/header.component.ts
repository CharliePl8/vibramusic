import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, UserAvatarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly showNav = signal(false);
  readonly menuOpen = signal(false);
  readonly currentUrl = signal('');

  private auth = inject(AuthService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  readonly currentUser = this.auth.currentUser;
  readonly isAdmin = this.auth.isAdmin;
  readonly theme = this.themeService.theme;

  readonly navItems = [
    { key: 'about', label: 'Nosotros' },
    { key: 'courses', label: 'Cursos' },
    { key: 'studio', label: 'Estudio' },
    { key: 'masterclasses', label: 'Masterclasses' },
    { key: 'contact', label: 'Contacto' },
  ];

  constructor() {
    this.currentUrl.set(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects || event.url));
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.showNav.set(window.scrollY > window.innerHeight * 0.6);
    this.menuOpen.set(false);
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  scrollTo(sectionId: string) {
    this.menuOpen.set(false);
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToTop() {
    this.menuOpen.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async logout() {
    this.menuOpen.set(false);
    await this.auth.logout();
    this.router.navigate(['/']);
  }

  firstName(): string {
    const name = this.currentUser()?.name;
    return name?.split(' ')[0] ?? '';
  }

  toggleTheme() {
    this.themeService.toggle();
  }
}
