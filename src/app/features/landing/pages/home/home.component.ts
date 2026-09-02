import { Component } from '@angular/core';
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
export class HomeComponent {}