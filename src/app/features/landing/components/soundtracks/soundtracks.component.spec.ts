import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundtracksComponent } from './soundtracks.component';
import { ContactDraftService } from '../../../../core/services/contact-draft.service';
import {
  SpotifyEmbedController,
  SpotifyEmbedService,
  SpotifyPlaybackEvent,
} from '../../../../core/services/spotify-embed.service';

type SpotifyEvent = 'ready' | 'playback_started' | 'playback_update';

class FakeSpotifyController implements SpotifyEmbedController {
  readonly pause = vi.fn();
  readonly destroy = vi.fn();
  private readonly listeners = new Map<
    SpotifyEvent,
    Array<(event: SpotifyPlaybackEvent) => void>
  >();

  addListener(event: SpotifyEvent, listener: (event: SpotifyPlaybackEvent) => void): void {
    const listeners = this.listeners.get(event) ?? [];
    listeners.push(listener);
    this.listeners.set(event, listeners);
  }

  emit(event: SpotifyEvent, isPaused = false): void {
    this.listeners.get(event)?.forEach((listener) => listener({ data: { isPaused } }));
  }
}

describe('SoundtracksComponent', () => {
  let fixture: ComponentFixture<SoundtracksComponent>;
  let controllers: FakeSpotifyController[];

  beforeEach(async () => {
    controllers = [];

    const spotify = {
      createController: vi.fn(
        (
          _host: HTMLElement,
          _options: unknown,
          onPlaybackStarted: () => void,
          onPlaybackUpdate: (isPaused: boolean) => void,
        ) => {
          const controller = new FakeSpotifyController();
          controller.addListener('playback_started', onPlaybackStarted);
          controller.addListener('playback_update', (event) => {
            if (event.data.isPaused !== undefined) {
              onPlaybackUpdate(event.data.isPaused);
            }
          });
          controllers.push(controller);
          return Promise.resolve(controller);
        },
      ),
    };

    await TestBed.configureTestingModule({
      imports: [SoundtracksComponent],
      providers: [
        { provide: SpotifyEmbedService, useValue: spotify },
        { provide: ContactDraftService, useValue: { setMessage: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundtracksComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('pausa la pista anterior cada vez que se reanuda otra', () => {
    const [first, second] = controllers;

    first.emit('playback_started');
    second.emit('playback_update', false);
    expect(first.pause).toHaveBeenCalledTimes(1);

    first.emit('playback_update', false);
    expect(second.pause).toHaveBeenCalledTimes(2);

    first.emit('playback_update', false);
    expect(second.pause).toHaveBeenCalledTimes(2);
  });
});
