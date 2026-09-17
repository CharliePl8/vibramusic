export const STUDIO_SERVICES = ['Grabación', 'Mezcla', 'Mastering', 'Ensayos'] as const;

export type StudioService = (typeof STUDIO_SERVICES)[number];

export const STUDIO_SLOTS = ['09:00–12:00', '12:00–15:00', '16:00–19:00', '19:00–22:00'] as const;

export type StudioSlot = (typeof STUDIO_SLOTS)[number];

export interface Booking {
  id: string;
  userId: string;
  date: string;
  slot: StudioSlot;
  service: StudioService;
  notes: string;
  createdAt: number;
}
