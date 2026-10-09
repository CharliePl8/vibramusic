import { AudioDemo } from '../models/service.model';

export const STUDIO_GEAR = [
  'Neve 8078 Console',
  'SSL 4000 E/G',
  'Pro Tools HD',
  '100+ Vintage Microphones',
  'Neumann U87 (×8)',
  'API 2500 Compressor',
  'Lexicon 480L Reverb',
  'Studer A820 (2" tape)',
];

export const STUDIO_DEMOS: AudioDemo[] = [
  {
    title: '"Amanecer"',
    artist: 'Luna Quartet',
    genre: 'Jazz',
    desc: '2 sesiones · mezcla analógica con reverb de placa vintage',
    dur: '3:42',
    bars: [5, 10, 7, 18, 12, 22, 8, 15, 20, 6, 13, 19, 9, 16, 11, 21, 7, 14, 18, 5, 10, 16],
  },
  {
    title: '"Ciudad Viva"',
    artist: 'Marco & The Band',
    genre: 'Rock',
    desc: 'Drums en sala grande · guitarras en cabina aislada · post-producción completa',
    dur: '4:15',
    bars: [12, 20, 8, 16, 22, 10, 18, 14, 24, 7, 20, 15, 9, 21, 13, 18, 11, 23, 8, 16, 20, 12],
  },
  {
    title: '"Silence"',
    artist: 'Elena Castillo',
    genre: 'Clásico',
    desc: 'Solo de violín · reverb de sala natural · grabación íntima en sesión única',
    dur: '5:03',
    bars: [6, 9, 14, 8, 17, 12, 20, 7, 15, 11, 18, 9, 13, 16, 8, 21, 10, 14, 19, 6, 12, 17],
  },
  {
    title: '"Bajo el Sol"',
    artist: 'Dúo Atlántico',
    genre: 'Flamenco',
    desc: 'Guitarra acústica y voz · grabado en sala grande con microfoneado estéreo',
    dur: '4:28',
    bars: [8, 15, 11, 20, 7, 17, 13, 22, 9, 18, 14, 10, 19, 12, 16, 8, 21, 11, 17, 9, 14, 20],
  },
  {
    title: '"Circuito Norte"',
    artist: 'NEON',
    genre: 'Electrónica',
    desc: 'Síntesis modular · masterización en cinta analógica Studer A820',
    dur: '6:17',
    bars: [20, 14, 22, 8, 18, 24, 11, 19, 16, 22, 9, 17, 21, 13, 20, 8, 23, 15, 19, 12, 21, 17],
  },
];

export const HERO_BG_IMAGE =
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&h=900&fit=crop&auto=format';
export const ABOUT_IMAGE = '/assets/images/sobrenosotros.jpg';
export const STUDIO_IMAGE =
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=700&h=500&fit=crop&auto=format';
