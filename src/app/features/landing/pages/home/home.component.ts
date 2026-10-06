import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { HeroComponent } from '../../components/hero/hero.component';
import { QuickAccessComponent } from '../../components/quick-access/quick-access.component';
import { AboutComponent } from '../../components/about/about.component';
import { CoursesComponent } from '../../components/courses/courses.component';
import { MasterclassesComponent } from '../../components/masterclasses/masterclasses.component';
import { StudioComponent } from '../../components/studio/studio.component';
import { ContactComponent } from '../../components/contact/contact.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    QuickAccessComponent,
    AboutComponent,
    CoursesComponent,
    MasterclassesComponent,
    StudioComponent,
    ContactComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    const handler = () => setTimeout(() => this.scrollToSection(), 0);
    handler();
    const sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(handler);
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  private scrollToSection() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const targets: Record<string, string> = {
      studio: 'studio',
      booking: 'studio',
      contact: 'contact',
    };
    const id = targets[hash];
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
