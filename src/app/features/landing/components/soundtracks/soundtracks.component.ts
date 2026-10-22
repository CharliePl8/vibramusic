import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SOUNDTRACKS } from '../../../../core/data/soundtracks.data';
import { ContactDraftService } from '../../../../core/services/contact-draft.service';

@Component({
  selector: 'app-soundtracks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './soundtracks.component.html',
  styleUrl: './soundtracks.component.scss',
})
export class SoundtracksComponent implements OnInit {
  readonly soundtracks = SOUNDTRACKS;
  spotifyEmbeds: SafeHtml[] = [];

  private readonly contactDraft = inject(ContactDraftService);
  private readonly sanitizer = inject(DomSanitizer);

  ngOnInit() {
    this.spotifyEmbeds = this.soundtracks.map((track) => {
      if (!track.embedUrl) {
        return this.sanitizer.bypassSecurityTrustHtml('');
      }
      const htmlCode = `<iframe src="${track.embedUrl}" width="100%" height="352" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:12px"></iframe>`;
      return this.sanitizer.bypassSecurityTrustHtml(htmlCode);
    });
  }

  contactAboutBso() {
    this.contactDraft.setMessage(
      'Hola, me interesa producir una banda sonora original (BSO). Me gustaría contaros mi proyecto.',
    );
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
