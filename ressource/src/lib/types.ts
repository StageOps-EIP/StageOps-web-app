export type EquipmentStatus = 'ok' | 'to-check' | 'hs' | 'repair';
export type EquipmentCategory = 'sound' | 'light' | 'video' | 'set' | 'safety' | 'rigging';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  qrCode: string;
  status: EquipmentStatus;
  location: string;
  zone?: string;
  eventId?: string;
  responsiblePerson?: string;
  lastCheck?: Date;
  position?: { x: number; y: number; z?: number };
  notes?: string;
}

export interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  venue: string;
  stage: string;
  checklistProgress: number;
  equipmentIds: string[];
  teamMembers: string[];
  status: 'planning' | 'setup' | 'running' | 'strike' | 'completed';
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  equipmentId?: string;
  reportedBy: string;
  timestamp: Date;
  resolvedAt?: Date;
  resolutionNotes?: string;
  images?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  email: string;
  phone?: string;
  permissions: string[];
}
