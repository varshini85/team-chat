export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Channel {
  id: number;
  name: string;
  description?: string | null;
  is_member?: boolean;
}

export interface Message {
  id: number;
  text: string;
  created_at: string;
  sender: User;
}
