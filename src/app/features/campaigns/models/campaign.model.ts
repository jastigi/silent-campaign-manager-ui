export type CampaignStatus =
  | 'ACTIVE'
  | 'FINISHED'
  | 'ABANDONED';

export interface Campaign {
  id: number;
  name: string;
  description: string | null;
  startDate: string;
  status: CampaignStatus;
}

export interface PatrolSummary {
  id: number;
  patrolName: string;
  area: string;
  result: string | null;
}

export interface CampaignDetails extends Campaign {
  patrols: PatrolSummary[];
}