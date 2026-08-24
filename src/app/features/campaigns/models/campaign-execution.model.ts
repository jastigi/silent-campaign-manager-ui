export type CampaignExecutionStatus = 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface CampaignExecution {
  id: number;
  campaignId: number;
  campaignName: string;
  status: CampaignExecutionStatus;
  totalPatrols: number;
  completedPatrols: number;
  startedAt: string;
  completedAt: string | null;
  failureMessage: string | null;
}
