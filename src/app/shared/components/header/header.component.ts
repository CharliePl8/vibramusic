import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly showNav = signal(false);

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
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
