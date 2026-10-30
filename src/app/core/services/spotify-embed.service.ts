import { Injectable } from '@angular/core';

export interface SpotifyPlaybackEvent {
  data: {
    playingURI?: string;
    isPaused?: boolean;
    isBuffering?: boolean;
    duration?: number;
    position?: number;
  };
}

export interface SpotifyEmbedController {
  addListener(
    event: 'ready' | 'playback_started' | 'playback_update',
    listener: (event: SpotifyPlaybackEvent) => void,
  ): void;
  pause(): void;
  destroy(): void;
}

export interface SpotifyEmbedOptions {
  uri?: string;
  url?: string;
  width?: string | number;
  height?: string | number;
}

export interface SpotifyIframeApi {
  createController(
    element: HTMLElement,
    options: SpotifyEmbedOptions,
    callback: (controller: SpotifyEmbedController) => void,
  ): void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
    spotifyIframeApi?: SpotifyIframeApi;
  }
}

@Injectable({ providedIn: 'root' })
export class SpotifyEmbedService {
  private apiPromise?: Promise<SpotifyIframeApi>;

  loadApi(): Promise<SpotifyIframeApi> {
    if (this.apiPromise) {
      return this.apiPromise;
    }

    this.apiPromise = new Promise<SpotifyIframeApi>((resolve, reject) => {
      if (window.spotifyIframeApi) {
        resolve(window.spotifyIframeApi);
        return;
      }

      window.onSpotifyIframeApiReady = (api) => {
        window.spotifyIframeApi = api;
        resolve(api);
      };

      const script = document.createElement('script');
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      script.onerror = () => reject(new Error('No se pudo cargar la API de Spotify.'));
      document.head.appendChild(script);
    });

    return this.apiPromise;
  }

  async createController(
    host: HTMLElement,
    options: SpotifyEmbedOptions,
    onPlaybackStarted: () => void,
    onPlaybackUpdate: (isPaused: boolean) => void,
  ): Promise<SpotifyEmbedController> {
    const api = await this.loadApi();

    return new Promise<SpotifyEmbedController>((resolve) => {
      api.createController(host, options, (controller) => {
        controller.addListener('playback_started', onPlaybackStarted);
        controller.addListener('playback_update', (event) => {
          if (event.data.isPaused !== undefined) {
            onPlaybackUpdate(event.data.isPaused);
          }
        });
        resolve(controller);
      });
    });
  }
}
