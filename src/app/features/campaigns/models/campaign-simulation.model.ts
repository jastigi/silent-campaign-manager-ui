export interface CampaignSimulationProgress {
  totalPatrols: number;
  completedPatrols: number;
  pendingPatrols: number;
  completionPercentage: number;
  completed: boolean;
}

export interface CampaignPatrolSimulationResult {
  summary: string;
  finalState: string;
  completionDate: string;
  contactsDetected: number;
  contactsLost: number;
  intelligenceGathered: number;
  incidents: number;
  timeline: string[];
  missionOutcome: string;
  missionScore: number;
  missionDebrief: string;
}

export interface CampaignSimulationResult {
  campaignId: number;
  campaignName: string;
  executedAt: string;
  progress: CampaignSimulationProgress;
  patrolResults: CampaignPatrolSimulationResult[];
}