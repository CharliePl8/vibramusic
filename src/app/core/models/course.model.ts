export type CourseCategory =
  'guitar' | 'piano' | 'voice' | 'drums' | 'bass' | 'violin' | 'theory' | 'recording';

export type Modality = 'individual' | 'group' | 'online';

export interface Course {
  id: string;
  name: string;
  category: CourseCategory;
  modality: Modality;
  teacher: string;
  level: string;
  description: string;
  price: number;
}
