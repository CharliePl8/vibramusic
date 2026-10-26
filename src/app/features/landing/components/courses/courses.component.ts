import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  COURSES,
  COURSE_CATEGORY_NAMES,
  COURSE_FILTER_LOGOS,
  COURSE_LOGOS,
  MODALITY_DURATION,
  MODALITY_ES,
  MODALITY_ICON,
} from '../../../../core/data/courses.data';
import { Course, CourseCategory, Modality, PriceUnit } from '../../../../core/models/course.model';
import { ContactDraftService } from '../../../../core/services/contact-draft.service';

interface GroupedCourse {
  category: CourseCategory;
  name: string;
  logo: string;
  courses: Course[];
}

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
  readonly modalityDurations = MODALITY_DURATION;

  private readonly contactDraft = inject(ContactDraftService);

  readonly categories: CourseCategory[] = Array.from(
    new Set(this.courses.map((course) => course.category)),
  );
  readonly modalities: Modality[] = Array.from(
    new Set(this.courses.map((course) => course.modality)),
  );

  readonly categoryFilter = signal<string>('all');
  readonly modalityFilter = signal<string>('all');
  readonly expandedCategory = signal<CourseCategory | null>(null);

  get groupedCourses(): GroupedCourse[] {
    const grouped = new Map<CourseCategory, Course[]>();
    for (const course of this.courses) {
      grouped.set(course.category, [...(grouped.get(course.category) ?? []), course]);
    }
    return Array.from(grouped.entries()).map(([category, courses]) => ({
      category,
      name: this.categoryNames[category],
      logo: this.courseLogos[category],
      courses: courses.sort((a, b) => {
        const order: Record<Modality, number> = { individual: 0, group: 1, ensemble: 2 };
        return order[a.modality] - order[b.modality];
      }),
    }));
  }

  get filteredGroups(): GroupedCourse[] {
    return this.groupedCourses
      .filter(
        (group) => this.categoryFilter() === 'all' || group.category === this.categoryFilter(),
      )
      .map((group) => ({
        ...group,
        courses: group.courses.filter(
          (course) => this.modalityFilter() === 'all' || course.modality === this.modalityFilter(),
        ),
      }))
      .filter((group) => group.courses.length > 0);
  }

  hasAnyResults(): boolean {
    return this.filteredGroups.length > 0;
  }

  setCategory(category: string) {
    this.categoryFilter.set(category);
    if (category !== 'all' && this.expandedCategory() === null) {
      // no auto-expand; keep user choice
    }
  }

  setModality(modality: string) {
    this.modalityFilter.set(modality);
  }

  toggleCategory(category: CourseCategory) {
    if (this.expandedCategory() === category) {
      this.expandedCategory.set(null);
    } else {
      this.expandedCategory.set(category);
    }
  }

  reserve(course: Course) {
    this.contactDraft.setMessage(
      [
        `Hola, me interesa el curso "${course.name}".`,
        `Modalidad: ${this.modalityName(course.modality)} (${this.modalityDuration(course.modality)})`,
        `Nivel: ${course.level}`,
        `Precio: ${course.price}€/${this.priceUnitName(course.priceUnit)}`,
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

  modalityDuration(key: Modality): string {
    return this.modalityDurations[key];
  }

  priceUnitName(unit: PriceUnit): string {
    return unit;
  }

  isCategoryExpanded(category: CourseCategory): boolean {
    return this.expandedCategory() === category;
  }
}
