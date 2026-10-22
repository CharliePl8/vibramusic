export type CourseCategory =
  | 'guitar'
  | 'piano'
  | 'voice'
  | 'choir'
  | 'drums'
  | 'bass'
  | 'violin'
  | 'wind'
  | 'theory'
  | 'recording';

export type Modality = 'individual' | 'group' | 'ensemble';

export type PriceUnit = 'mes' | 'semana';

export interface Course {
  id: string;
  name: string;
  category: CourseCategory;
  modality: Modality;
  level: string;
  price: number;
  priceUnit: PriceUnit;
}
