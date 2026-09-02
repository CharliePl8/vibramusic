import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { STUDIO_DEMOS } from '../../../../core/data/studio.data';

@Component({
  selector: 'app-audio-tracklist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-tracklist.component.html',
  styleUrl: './audio-tracklist.component.scss',
})
export class AudioTracklistComponent implements OnDestroy {
  readonly demos = STUDIO_DEMOS;

  readonly playingIdx = signal<number | null>(null);
  readonly progress = signal<Record<number, number>>({});

  private interval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startProgressLoop();
  }

  private startProgressLoop() {
    this.interval = setInterval(() => {
      const idx = this.playingIdx();
      if (idx === null) return;

      this.progress.update((prev) => {
        const cur = (prev[idx] || 0) + 0.4;
        if (cur >= 100) {
          this.playingIdx.set(null);
          return { ...prev, [idx]: 0 };
        }
        return { ...prev, [idx]: cur };
      });
    }, 300);
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  toggle(index: number) {
    if (this.playingIdx() === index) {
      this.playingIdx.set(null);
    } else {
      this.playingIdx.set(index);
      this.progress.update((prev) => ({ ...prev, [index]: prev[index] || 0 }));
    }
  }

  barHeight(currentPlaying: boolean, height: number): number {
    return currentPlaying ? height : Math.max(4, height * 0.35);
  }
}