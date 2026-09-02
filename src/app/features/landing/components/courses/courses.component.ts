import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  COURSES,
  INSTRUMENT_EMOJI,
  INSTRUMENT_ES,
  MODALITY_ES,
  MODALITY_ICON,
} from '../../../../core/data/courses.data';
import { Course, Instrument, Modality } from '../../../../core/models/course.model';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class CoursesComponent {
  readonly courses = COURSES;
  readonly instrumentEmoji = INSTRUMENT_EMOJI;
  readonly instrumentNames = INSTRUMENT_ES;
  readonly modalityNames = MODALITY_ES;
  readonly modalityIcons = MODALITY_ICON;

  readonly instruments: Instrument[] = Array.from(
    new Set(this.courses.map((c) => c.instrument)),
  );
  readonly modalities: Modality[] = Array.from(
    new Set(this.courses.map((c) => c.modality)),
  );

  readonly instrFilter = signal<string>('all');
  readonly modalityFilter = signal<string>('all');
  readonly expandedCourse = signal<string | null>(null);

  get filteredCourses(): Course[] {
    return this.courses.filter(
      (c) =>
        (this.instrFilter() === 'all' || c.instrument === this.instrFilter()) &&
        (this.modalityFilter() === 'all' || c.modality === this.modalityFilter()),
    );
  }

  setInstr(instr: string) {
    this.instrFilter.set(instr);
  }

  setModality(mod: string) {
    this.modalityFilter.set(mod);
  }

  toggleCourse(id: string) {
    this.expandedCourse.set(this.expandedCourse() === id ? null : id);
  }

  instrumentName(key: Instrument): string {
    return this.instrumentNames[key];
  }

  modalityName(key: Modality): string {
    return this.modalityNames[key];
  }
}
