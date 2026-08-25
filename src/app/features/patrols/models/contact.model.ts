export type ContactType = 'SUBMARINE' | 'SURFACE_SHIP' | 'AIRCRAFT' | 'UNKNOWN';

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Nation = 'USA' | 'USSR' | 'UK' | 'FRANCE' | 'NATO' | 'UNKNOWN';

export type NationAlignment = 'FRIENDLY' | 'HOSTILE' | 'NEUTRAL' | 'UNKNOWN';

export interface Contact {
  id: number;
  contactName: string;
  contactType: ContactType;
  threatLevel: ThreatLevel;
  detectionDate: string;
  patrolId: number;
  nation: Nation;
  nationAlignment: NationAlignment;
  confidenceLevel: number;
  notes: string | null;
  submarineClass: string | null;
}
