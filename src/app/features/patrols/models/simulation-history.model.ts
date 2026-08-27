export type SimulationOutcome =
  | 'SUCCESS'
  | 'PARTIAL_SUCCESS'
  | 'FAILURE';

export type PatrolSimulationState =
  | 'NOT_STARTED'
  | 'TRANSIT'
  | 'ON_PATROL'
  | 'RETURNING'
  | 'COMPLETED';

export interface SimulationHistoryRecord {
  id: number;

  patrolId: number;

  patrolName: string;

  missionOutcome: SimulationOutcome;

  missionScore: number;

  finalState: PatrolSimulationState;

  contactsDetected: number;

  contactsLost: number;

  intelligenceGathered: number;

  incidents: number;

  completionDate: string;

  recordedAt: string;

  reportSummary: string;

  missionDebrief: string;
}
