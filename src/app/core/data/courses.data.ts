import { Course, CourseCategory, Modality } from '../models/course.model';

export const COURSE_CATEGORY_NAMES: Record<CourseCategory, string> = {
  guitar: 'Guitarra',
  piano: 'Piano',
  voice: 'Canto',
  drums: 'Batería',
  bass: 'Bajo',
  violin: 'Violín',
  theory: 'Teoría Musical',
  recording: 'Grabación',
};

export const COURSE_FILTER_LOGOS: Record<CourseCategory, string> = {
  guitar: '/assets/images/cursos/guitarra-rojo.png',
  piano: '/assets/images/cursos/piano-rojo.png',
  voice: '/assets/images/cursos/canto-rojo.png',
  drums: '/assets/images/cursos/bateria-rojo.png',
  bass: '/assets/images/cursos/guitarra-rojo.png',
  violin: '/assets/images/cursos/violin-rojo.png',
  theory: '/assets/images/cursos/teoriamusical-rojo.png',
  recording: '/assets/images/cursos/grabacion-rojo.png',
};

export const COURSE_LOGOS: Record<CourseCategory, string> = {
  guitar: '/assets/images/cursos/guitarra-rojo.png',
  piano: '/assets/images/cursos/piano-rojo.png',
  voice: '/assets/images/cursos/canto-rojo.png',
  drums: '/assets/images/cursos/bateria-rojo.png',
  bass: '/assets/images/cursos/guitarra-rojo.png',
  violin: '/assets/images/cursos/violin-rojo.png',
  theory: '/assets/images/cursos/teoriamusical-rojo.png',
  recording: '/assets/images/cursos/grabacion-rojo.png',
};

export const MODALITY_ES: Record<Modality, string> = {
  individual: 'Individual',
  group: 'Grupal',
  online: 'Online',
};

export const MODALITY_ICON: Record<Modality, string> = {
  individual: '👤',
  group: '👥',
  online: '💻',
};

export const COURSES: Course[] = [
  {
    id: 'c1',
    name: 'Guitarra Clásica',
    category: 'guitar',
    modality: 'individual',
    teacher: 'Carlos Romero',
    level: 'Todos los niveles',
    description:
      'Técnica clásica, lectura musical y repertorio desde Bach hasta Villa-Lobos. Clases individuales personalizadas para tu nivel y objetivos.',
    price: 120,
  },
  {
    id: 'c2',
    name: 'Piano Jazz',
    category: 'piano',
    modality: 'individual',
    teacher: 'María Fernández',
    level: 'Intermedio · Avanzado',
    description:
      'Armonía jazz, improvisación y voicings para piano. Desbloquea el lenguaje del jazz desde sus fundamentos hasta la libre improvisación.',
    price: 130,
  },
  {
    id: 'c3',
    name: 'Canto Pop / Rock',
    category: 'voice',
    modality: 'individual',
    teacher: 'Laura Santos',
    level: 'Todos los niveles',
    description:
      'Técnica vocal, proyección, respiración y estilo. Para cantantes que quieren encontrar su propia voz en el mundo del pop y el rock.',
    price: 110,
  },
  {
    id: 'c4',
    name: 'Batería',
    category: 'drums',
    modality: 'group',
    teacher: 'Diego Martínez',
    level: 'Iniciación · Intermedio',
    description:
      'Groove, rudimentos, fills y teoría del ritmo. Clases grupales de máx. 4 alumnos. Material disponible en sala.',
    price: 80,
  },
  {
    id: 'c5',
    name: 'Bajo Eléctrico',
    category: 'bass',
    modality: 'online',
    teacher: 'Andrés López',
    level: 'Todos los niveles',
    description:
      'Fundamentos del bajo, slap, fingerstyle y cifrado. 100% online con acceso a materiales exclusivos y sesiones grabadas.',
    price: 95,
  },
  {
    id: 'c6',
    name: 'Violín Clásico',
    category: 'violin',
    modality: 'individual',
    teacher: 'Elena Castillo',
    level: 'Iniciación · Intermedio',
    description:
      'Postura, arco, afinación y repertorio orquestal. Pedagoga formada en el Real Conservatorio Superior de Música de Madrid.',
    price: 125,
  },
  {
    id: 'c7',
    name: 'Teoría Musical',
    category: 'theory',
    modality: 'group',
    teacher: 'Lucía Álvarez',
    level: 'Iniciación · Intermedio',
    description:
      'Lectura, armonía, ritmo y análisis de piezas para comprender la música con una base sólida y aplicada.',
    price: 85,
  },
  {
    id: 'c8',
    name: 'Grabación Musical',
    category: 'recording',
    modality: 'online',
    teacher: 'Javier Núñez',
    level: 'Iniciación · Avanzado',
    description:
      'Técnica de grabación, microfonía y mezcla para aprender a producir una sesión profesional desde tu propio equipo.',
    price: 105,
  },
];
