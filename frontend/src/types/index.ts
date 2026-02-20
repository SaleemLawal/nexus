export interface User {
  id: string;
  display_name: string;
  avatar_color: string;
  token?: string;
  created_at: string;
}

export interface Space {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  emoji: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  member_count?: number;
  board_count?: number;
}

export interface SpaceMember {
  id: string;
  space_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  user?: User;
}

export interface Board {
  id: string;
  space_id: string;
  title: string;
  description?: string;
  cover_color: string;
  position: number;
  created_by?: string;
  created_at: string;
  pin_count?: number;
}

export type PinType = 'image' | 'link' | 'note' | 'checklist';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Pin {
  id: string;
  board_id: string;
  created_by?: string;
  type: PinType;
  title?: string;
  content?: string;
  image_url?: string;
  link_url?: string;
  metadata?: Record<string, unknown>;
  position: number;
  created_at: string;
  creator?: User;
}

export interface Poll {
  id: string;
  space_id: string;
  created_by?: string;
  question: string;
  is_multi_select: boolean;
  closes_at?: string;
  created_at: string;
  options: PollOption[];
  creator?: User;
  total_votes?: number;
}

export interface PollOption {
  id: string;
  poll_id: string;
  label: string;
  position: number;
  vote_count: number;
  user_voted: boolean;
}

export type MessageType = 'text' | 'image' | 'poll_ref' | 'pin_ref';

export interface Message {
  id: string;
  space_id: string;
  user_id?: string;
  content: string;
  message_type: MessageType;
  metadata?: Record<string, unknown>;
  created_at: string;
  user?: User;
}

export interface CalendarEvent {
  id: string;
  space_id: string;
  created_by?: string;
  title: string;
  description?: string;
  location?: string;
  starts_at: string;
  ends_at?: string;
  color: string;
  created_at: string;
  creator?: User;
}
