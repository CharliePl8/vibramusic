import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ABOUT_IMAGE } from '../../../../core/data/studio.data';

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  private readonly image = ABOUT_IMAGE;

  readonly stats: Stat[] = [
    { value: '200+', label: 'Alumnos activos' },
    { value: '12', label: 'Profesores expertos' },
    { value: '8', label: 'Disciplinas' },
    { value: '500+', label: 'Grabaciones' },
  ];

  get imageStyle() {
    return { 'background-image': `url(${this.image})` };
  }
}
