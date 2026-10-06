import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MASTERCLASSES } from '../../../../core/data/masterclasses.data';
import { Masterclass } from '../../../../core/models/masterclass.model';

const LEVEL_CLASS: Record<string, string> = {
  Principiante: 'level--beginner',
  Intermedio: 'level--intermediate',
  Avanzado: 'level--advanced',
  'Todos los niveles': 'level--all',
};

const INSTRUMENT_ICON: Record<string, string> = {
  Guitarra: '🎸',
  Piano: '🎹',
  Voz: '🎤',
  Percusión: '🥁',
  Batería: '🥁',
  Bajo: '🎸',
  Violín: '🎻',
  Saxofón: '🎷',
  Producción: '🎛️',
};

const STYLE_ICON: Record<string, string> = {
  Jazz: '🎺',
  Flamenco: '💃',
  Clásico: '🎼',
  'Pop / Soul': '🎵',
  Electrónica: '🔊',
  Rock: '⚡',
  World: '🌍',
};

@Component({
  selector: 'app-masterclasses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './masterclasses.component.html',
  styleUrl: './masterclasses.component.scss',
})
export class MasterclassesComponent {
  readonly masterclasses = MASTERCLASSES;
  readonly levels = Array.from(new Set(MASTERCLASSES.map((m) => m.level)));
  readonly tags = Array.from(new Set(MASTERCLASSES.flatMap((m) => m.tags)));

  readonly search = signal('');
  readonly levelFilter = signal('all');
  readonly tagFilter = signal('all');

  get filtered(): Masterclass[] {
    const q = this.search().toLowerCase();
    return this.masterclasses.filter((m) => {
      const matchSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.instructor.toLowerCase().includes(q) ||
        m.tags.some((tag) => tag.includes(q));
      const matchLevel = this.levelFilter() === 'all' || m.level === this.levelFilter();
      const matchTag = this.tagFilter() === 'all' || m.tags.includes(this.tagFilter());
      return matchSearch && matchLevel && matchTag;
    });
  }

  get hasFilters(): boolean {
    return !!this.search() || this.levelFilter() !== 'all' || this.tagFilter() !== 'all';
  }

  onSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
  }

  clearSearch() {
    this.search.set('');
  }

  setLevel(level: string) {
    this.levelFilter.set(level);
  }

  setTag(tag: string) {
    this.tagFilter.set(tag);
  }

  clearFilters() {
    this.search.set('');
    this.levelFilter.set('all');
    this.tagFilter.set('all');
  }

  levelClass(level: string): string {
    return LEVEL_CLASS[level] ?? '';
  }

  instrumentIcon(instrument?: string): string {
    return instrument ? INSTRUMENT_ICON[instrument] ?? '🎵' : '';
  }

  styleIcon(style?: string): string {
    return style ? STYLE_ICON[style] ?? '🎶' : '';
  }

  // CTA del aviso de "próximamente": lleva al formulario de contacto.
  scrollToContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}