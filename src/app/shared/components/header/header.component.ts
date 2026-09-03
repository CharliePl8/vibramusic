import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly showNav = signal(false);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly currentUser = this.auth.currentUser;

  readonly navItems = [
    { key: 'about', label: 'Nosotros' },
    { key: 'courses', label: 'Cursos' },
    { key: 'masterclasses', label: 'Masterclasses' },
    { key: 'studio', label: 'Estudio' },
    { key: 'contact', label: 'Contacto' },
  ];

  @HostListener('window:scroll', [])
  onScroll() {
    this.showNav.set(window.scrollY > window.innerHeight * 0.6);
  }

  scrollTo(sectionId: string) {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  firstName(): string {
    const name = this.currentUser()?.name;
    return name?.split(' ')[0] ?? '';
  }
}