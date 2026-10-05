import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {

get bgStyle() {
  return { 'background-image': "url('/assets/images/Portada.png')" };
}   

  onExplore() {
    const el = document.getElementsByClassName('quick')[0];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
