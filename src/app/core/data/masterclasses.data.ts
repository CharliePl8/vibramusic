import { Masterclass } from '../models/masterclass.model';

export const MASTERCLASSES: Masterclass[] = [
  {
    id: 'mc1',
    title: 'Improvisación en Jazz',
    instructor: 'John Morales',
    description:
      'Domina las escalas modales, el lenguaje bebop y el intercambio de acordes para improvisar sobre cualquier standard de jazz con fluidez y confianza total.',
    price: 29,
    image:
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=340&fit=crop&auto=format',
    duration: '4h 30min',
    level: 'Intermedio',
    tags: ['jazz', 'improvisación', 'escalas'],
    instrument: 'Piano',
    style: 'Jazz',
  },
  {
    id: 'mc2',
    title: 'Técnica Vocal Avanzada',
    instructor: 'Sarah Connor',
    description:
      'Registros, mixvoz, belting, ornamentación y control emocional. Para cantantes que quieren llevar su voz al siguiente nivel sin dañarla.',
    price: 39,
    image:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=340&fit=crop&auto=format',
    duration: '3h 15min',
    level: 'Avanzado',
    tags: ['canto', 'vocal', 'técnica'],
    instrument: 'Voz',
    style: 'Pop / Soul',
  },
  {
    id: 'mc3',
    title: 'Producción Musical desde Cero',
    instructor: 'Alex Beats',
    description:
      'DAW, samples, síntesis, mezcla y mastering. Crea tu primera canción completa en este masterclass práctico e intensivo de producción electrónica.',
    price: 49,
    image:
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=340&fit=crop&auto=format',
    duration: '6h 00min',
    level: 'Principiante',
    tags: ['producción', 'DAW', 'beats'],
    instrument: 'Producción',
    style: 'Electrónica',
  },
  {
    id: 'mc4',
    title: 'Guitarra Flamenca',
    instructor: 'Paco Reyes',
    description:
      'Palos flamencos, picado, rasgueado y compás. Sumérgete en la esencia más pura de la guitarra española de la mano de un maestro del flamenco.',
    price: 35,
    image:
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=340&fit=crop&auto=format',
    duration: '3h 45min',
    level: 'Intermedio',
    tags: ['guitarra', 'flamenco', 'español'],
    instrument: 'Guitarra',
    style: 'Flamenco',
  },
  {
    id: 'mc5',
    title: 'Composición para Piano',
    instructor: 'Clara Novak',
    description:
      'Armonía funcional, forma sonata, progresiones modernas y escritura idiomática para el piano. Aprende a decir lo que sientes a través de la música.',
    price: 45,
    image:
      'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&h=340&fit=crop&auto=format',
    duration: '5h 00min',
    level: 'Intermedio',
    tags: ['piano', 'composición', 'armonía'],
    instrument: 'Piano',
    style: 'Clásico',
  },
  {
    id: 'mc6',
    title: 'Percusión Afrobrasileña',
    instructor: 'Rafael Lima',
    description:
      'Candomblé, samba, maracatu y axé. Ritmos afrobrasileños aplicados a la batería y percusión latina. Una experiencia musical única.',
    price: 29,
    image:
      'https://images.unsplash.com/photo-1571327073757-71d13ef1a25d?w=600&h=340&fit=crop&auto=format',
    duration: '3h 00min',
    level: 'Todos los niveles',
    tags: ['percusión', 'brasil', 'ritmo'],
    instrument: 'Percusión',
    style: 'World',
  },
];
