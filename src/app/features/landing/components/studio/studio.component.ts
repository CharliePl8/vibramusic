import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { STUDIO_GEAR, STUDIO_IMAGE } from '../../../../core/data/studio.data';
import { AudioTracklistComponent } from '../audio-tracklist/audio-tracklist.component';

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [CommonModule, AudioTracklistComponent],
  templateUrl: './studio.component.html',
  styleUrl: './studio.component.scss',
})
export class StudioComponent {
  readonly gear = STUDIO_GEAR;

  private readonly image = STUDIO_IMAGE;

  get imageStyle() {
    return { 'background-image': `url(${this.image})` };
  }
}