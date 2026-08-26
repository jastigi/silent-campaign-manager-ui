export type PatrolResult = 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE';

export type MissionStatus = 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'ABORTED';

export type MissionType =
  | 'DETERRENCE_PATROL'
  | 'FOLLOW_SSBN'
  | 'HUNT_SSN'
  | 'SURVEILLANCE'
  | 'INTELLIGENCE'
  | 'SPECIAL_OPERATION'
  | 'ESCORT'
  | 'TRAINING';

export interface Patrol {
  id: number;

  patrolName: string;

  patrolDate: string;

  area: string | null;

  result: PatrolResult | null;

  campaignId: number;

  submarineId: number;

  submarineName: string;

  missionType: MissionType;

  detectedContacts: number | null;
}

export interface PatrolReport {
  patrolId: number;

  patrolName: string;

  campaignId: number;

  campaignName: string;

  submarineId: number;

  submarineName: string;

  submarineClass: string;

  contactsDetected: number;

  submarineContacts: number;

  surfaceContacts: number;

  aircraftContacts: number;

  unknownContacts: number;

  detectedContacts: number;

  criticalContacts: number;

  highThreatContacts: number;

  averageConfidence: number;

  eventsRecorded: number;

  criticalEvents: number;

  riskScore: number;

  missionStatus: MissionStatus | null;
}

export interface MissionEvaluation {
  success: boolean;

  patrolResult: PatrolResult;

  score: number;

  summary: string;
}

export interface PatrolRequest {
  patrolName: string;

  patrolDate: string;

  area: string | null;

  submarineId: number;

  missionType: MissionType;
}
