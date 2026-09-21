export interface ContactMessage {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  message: string;
  read?: boolean;
  createdAt: number;
}
