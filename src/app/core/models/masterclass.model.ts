export interface Masterclass {
  id: string;
  title: string;
  instructor: string;
  description: string;
  price: number;
  image: string;
  duration: string;
  level: string;
  tags: string[];
  instrument?: string;
  style?: string;
}
