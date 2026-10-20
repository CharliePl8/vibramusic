import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ABOUT_IMAGE } from '../../../../core/data/studio.data';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  private readonly image = ABOUT_IMAGE;

  get imageStyle() {
    return { 'background-image': `url(${this.image})` };
  }
}
