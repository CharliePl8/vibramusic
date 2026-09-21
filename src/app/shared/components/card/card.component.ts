import { Component, input } from '@angular/core';

export type CardVariant = 'default' | 'elevated' | 'outlined';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  readonly variant = input<CardVariant>('default');
  readonly padding = input<string>('1.5rem');
}
