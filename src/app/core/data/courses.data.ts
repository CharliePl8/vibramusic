import { Course, Instrument, Modality } from '../models/course.model';

export const INSTRUMENT_EMOJI: Record<Instrument, string> = {
  guitar: '🎸',
  piano: '🎹',
  voice: '🎤',
  drums: '🥁',
  bass: '🎸',
  violin: '🎻',
  saxophone: '🎷',
};

export const INSTRUMENT_ES: Record<Instrument, string> = {
  guitar: 'Guitarra',
  piano: 'Piano',
  voice: 'Canto',
  drums: 'Batería',
  bass: 'Bajo',
  violin: 'Violín',
  saxophone: 'Saxofón',
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
    instrument: 'guitar',
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
    instrument: 'piano',
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
    instrument: 'voice',
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
    instrument: 'drums',
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
    instrument: 'bass',
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
    instrument: 'violin',
    modality: 'individual',
    teacher: 'Elena Castillo',
    level: 'Iniciación · Intermedio',
    description:
      'Postura, arco, afinación y repertorio orquestal. Pedagoga formada en el Real Conservatorio Superior de Música de Madrid.',
    price: 125,
  },
];
