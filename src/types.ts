export type UserRole = 'master' | 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  branch_id?: string;
  created_at: string;
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  phone?: string;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  branch_id: string;
  notes?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'O';
  tag_ids?: string[];
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Message {
  id: string;
  contact_id: string;
  user_id: string;
  type: 'whatsapp' | 'sms';
  content: string;
  status: 'sent' | 'failed' | 'pending';
  created_at: string;
}

export interface Automation {
  id: string;
  name: string;
  type: 'birthday' | 'welcome' | 'custom';
  enabled: boolean;
  channel: 'whatsapp' | 'sms' | 'both';
  whatsapp_template?: string;
  sms_template?: string;
  last_run?: string;
  created_at: string;
}
