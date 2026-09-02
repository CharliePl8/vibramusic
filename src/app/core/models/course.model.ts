export type Instrument =
  | 'guitar'
  | 'piano'
  | 'voice'
  | 'drums'
  | 'bass'
  | 'violin'
  | 'saxophone';

export type Modality = 'individual' | 'group' | 'online';

export interface Course {
  id: string;
  name: string;
  instrument: Instrument;
  modality: Modality;
  teacher: string;
  level: string;
  description: string;
  price: number;
}
