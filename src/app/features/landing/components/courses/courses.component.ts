import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  COURSES,
  COURSE_CATEGORY_NAMES,
  COURSE_FILTER_LOGOS,
  COURSE_LOGOS,
  MODALITY_ES,
  MODALITY_ICON,
} from '../../../../core/data/courses.data';
import { Course, CourseCategory, Modality } from '../../../../core/models/course.model';
import { ContactDraftService } from '../../../../core/services/contact-draft.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class CoursesComponent {
  readonly courses = COURSES;
  readonly categoryNames = COURSE_CATEGORY_NAMES;
  readonly filterLogos = COURSE_FILTER_LOGOS;
  readonly courseLogos = COURSE_LOGOS;
  readonly modalityNames = MODALITY_ES;
  readonly modalityIcons = MODALITY_ICON;

  private readonly contactDraft = inject(ContactDraftService);

  readonly categories: CourseCategory[] = Array.from(
    new Set(this.courses.map((course) => course.category)),
  );
  readonly modalities: Modality[] = Array.from(
    new Set(this.courses.map((course) => course.modality)),
  );

  readonly categoryFilter = signal<string>('all');
  readonly modalityFilter = signal<string>('all');
  readonly expandedCourse = signal<string | null>(null);

  get filteredCourses(): Course[] {
    return this.courses.filter(
      (course) =>
        (this.categoryFilter() === 'all' || course.category === this.categoryFilter()) &&
        (this.modalityFilter() === 'all' || course.modality === this.modalityFilter()),
    );
  }

  setCategory(category: string) {
    this.categoryFilter.set(category);
  }

  setModality(modality: string) {
    this.modalityFilter.set(modality);
  }

  toggleCourse(id: string) {
    this.expandedCourse.set(this.expandedCourse() === id ? null : id);
  }

  // Rellena el formulario de contacto con la petición del curso y lo lleva
  // allí. El borrador se escribe antes del scroll para que el mensaje esté
  // puesto cuando llegue.
  reserve(course: Course) {
    this.contactDraft.setMessage(
      [
        `Hola, me interesa el curso "${course.name}".`,
        `Modalidad: ${this.modalityName(course.modality)}`,
        `Nivel: ${course.level}`,
        `Profesor: ${course.teacher}`,
        `Precio: ${course.price}€/mes`,
        '',
        '¿Me podéis confirmar disponibilidad y horarios?',
      ].join('\n'),
    );
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  categoryName(key: CourseCategory): string {
    return this.categoryNames[key];
  }

  modalityName(key: Modality): string {
    return this.modalityNames[key];
  }
}
