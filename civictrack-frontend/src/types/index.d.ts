export interface User {
  id: number;
  email: string;
  username: string;
  number?: string;
  created_at?: string;
}
export interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'reported' | 'in_progress' | 'resolved';
  latitude: number;
  longitude: number;
  distance: number;
  created_at: string;
  images: string[];
  reporter_id?: number;
  is_anonymous: boolean;
}
export interface IssueFilters {
  category?: string;
  status?: string;
  radius: number;
}
