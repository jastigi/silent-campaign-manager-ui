export interface CampaignStatistics {
  totalPatrols: number;
  completedPatrols: number;
  pendingPatrols: number;
  completionPercentage: number;
  completed: boolean;

  totalSimulations: number;
  successfulSimulations: number;
  partialSuccessfulSimulations: number;
  failedSimulations: number;

  successRate: number;
  averageMissionScore: number;

  totalContactsDetected: number;
  totalContactsLost: number;
  totalIntelligenceGathered: number;
  totalIncidents: number;
}