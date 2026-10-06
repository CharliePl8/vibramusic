import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

const COURSES_CARD_IMAGE = '/assets/images/quick-access-cursos.png';
const MASTERCLASSES_CARD_IMAGE = '/assets/images/quick-access-masterclasses.png';
const STUDIO_CARD_IMAGE = '/assets/images/quick-access-estudio.png';

export interface QuickAccessCard {
  key: string;
  imageUrl: string;
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
      imageUrl: COURSES_CARD_IMAGE,
      label: 'Inscripción a Cursos',
      desc: 'Encuentra tu clase perfecta y elige tu horario.',
      accent: 'red',
    },
    {
      key: 'masterclasses',
      imageUrl: MASTERCLASSES_CARD_IMAGE,
      label: 'Masterclasses',
      desc: 'Aprende de los mejores a tu propio ritmo.',
      accent: 'violet',
    },
    {
      key: 'studio',
      imageUrl: STUDIO_CARD_IMAGE,
      label: 'Estudio de Grabación',
      desc: 'Reserva tu sesión en nuestro estudio profesional.',
      accent: 'amber',
    },
    {
      key: 'contact',
      imageUrl: COURSES_CARD_IMAGE,
      label: 'Contacto',
      desc: '¿Tienes alguna pregunta? Estamos aquí para ayudarte.',
      accent: 'lime',
    },
  ]);

  onNavigate(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
