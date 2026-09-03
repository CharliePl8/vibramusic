import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface QuickAccessCard {
  key: string;
  icon: string;
  label: string;
  desc: string;
  accent: 'red' | 'violet' | 'amber' | 'lime';
}

@Component({
  selector: 'app-quick-access',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-access.component.html',
  styleUrl: './quick-access.component.scss',
})
export class QuickAccessComponent {
  readonly cards = input<QuickAccessCard[]>([
    {
      key: 'courses',
      icon: '🎸',
      label: 'Inscripción a Cursos',
      desc: 'Encuentra tu clase perfecta y elige tu horario.',
      accent: 'red',
    },
    {
      key: 'masterclasses',
      icon: '🎬',
      label: 'Masterclasses',
      desc: 'Aprende de los mejores a tu propio ritmo.',
      accent: 'violet',
    },
    {
      key: 'studio',
      icon: '🎙️',
      label: 'Estudio de Grabación',
      desc: 'Reserva tu sesión en nuestro estudio profesional.',
      accent: 'amber',
    },
    // {
    //   key: 'contact',
    //   icon: '📞',
    //   label: 'Contacto',
    //   desc: '¿Tienes alguna pregunta? Estamos aquí para ayudarte.',
    //   accent: 'lime',
    // },
  ]);

  onNavigate(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
