export enum View {
  LANDING = 'LANDING',
  CONNECTION = 'CONNECTION',
  TIMELINE = 'TIMELINE',
  FOCUS = 'FOCUS',
  ANNIVERSARY = 'ANNIVERSARY',
  PROFILE = 'PROFILE',
  ACCOUNT_SECURITY = 'ACCOUNT_SECURITY',
  EDIT_PROFILE = 'EDIT_PROFILE'
}

export interface User {
  id: string;
  email: string;
  passwordHash: string; // In production this would be hashed on server
  invitationCode: string; // User's unique invite code
  createdAt: string;
  name?: string;
  avatar?: string;
  gender?: 'male' | 'female';
  partnerId?: string | null; // ID of the partner
}

export interface AuthState {
  currentUser: User | null;
  users: User[]; // Mock database of users
}

export interface Memory {
  id: string;
  title: string;
  date: string;
  image: string;
  rotation: string; // Tailwind class for slight rotation
}

export type EventType = string; // 支持自定义类型

// 预设的事件类型选项
export const DEFAULT_EVENT_TYPES = [
  '纪念日',
  '生日',
  '旅行',
  '节日',
  '其他'
] as const;

export interface AnniversaryEvent {
  id: string;
  title: string;
  subtitle: string;
  date: string; // YYYY-MM-DD
  type: EventType;
  image?: string;
}