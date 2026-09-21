export interface AudioDemo {
  title: string;
  artist: string;
  genre: string;
  desc: string;
  dur: string;
  bars: number[];
}

export interface StudioService {
  title: string;
  slug: string;
  description: string;
  features: string[];
  priceInfo: string;
  imageUrl: string;
}
