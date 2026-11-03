import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SOUNDTRACKS } from '../../../../core/data/soundtracks.data';
import { ContactDraftService } from '../../../../core/services/contact-draft.service';
import {
  SpotifyEmbedController,
  SpotifyEmbedService,
} from '../../../../core/services/spotify-embed.service';

@Component({
  selector: 'app-soundtracks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './soundtracks.component.html',
  styleUrl: './soundtracks.component.scss',
})
export class SoundtracksComponent implements AfterViewInit, OnDestroy {
  readonly soundtracks = SOUNDTRACKS;
  readonly spotifyFailed = signal(false);

  @ViewChildren('spotifyEmbed') private embedHosts!: QueryList<ElementRef<HTMLElement>>;

  private readonly contactDraft = inject(ContactDraftService);
  private readonly spotify = inject(SpotifyEmbedService);
  private readonly controllers = new Map<string, SpotifyEmbedController>();
  private activeTrackId: string | null = null;
  private destroyed = false;

  ngAfterViewInit(): void {
    void this.initEmbeds();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.destroyControllers();
  }

  contactAboutBso() {
    this.contactDraft.setMessage(
      'Hola, me interesa producir una banda sonora original (BSO). Me gustaría contaros mi proyecto.',
    );
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private async initEmbeds(): Promise<void> {
    try {
      const hosts = this.embedHosts.toArray();

      for (const [index, track] of this.soundtracks.entries()) {
        const host = hosts[index]?.nativeElement;
        if (!host) continue;

        const controller = await this.spotify.createController(
          host,
          {
            uri: track.spotifyUri,
            width: '100%',
            height: 352,
          },
          () => this.handlePlaybackState(track.id, false),
          (isPaused) => this.handlePlaybackState(track.id, isPaused),
        );

        if (this.destroyed) {
          controller.destroy();
          return;
        }

        this.controllers.set(track.id, controller);
      }
    } catch {
      if (this.destroyed) return;
      this.destroyControllers();
      this.spotifyFailed.set(true);
    }
  }

  private handlePlaybackState(trackId: string, isPaused: boolean): void {
    if (isPaused) {
      if (this.activeTrackId === trackId) {
        this.activeTrackId = null;
      }
      return;
    }

    if (this.activeTrackId === trackId) {
      return;
    }

    this.activeTrackId = trackId;
    this.pauseOthers(trackId);
  }

  private pauseOthers(currentId: string): void {
    this.controllers.forEach((controller, id) => {
      if (id !== currentId) {
        controller.pause();
      }
    });
  }

  private destroyControllers(): void {
    this.activeTrackId = null;
    this.controllers.forEach((controller) => controller.destroy());
    this.controllers.clear();
  }
}
