import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { HERO_BG_IMAGE } from '../../../../core/data/studio.data';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  private readonly bgImage = HERO_BG_IMAGE;

  get bgStyle() {
    return { 'background-image': `url(${this.bgImage})` };
  }

  onExplore() {
    const el = document.getElementsByClassName('quick')[0];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
