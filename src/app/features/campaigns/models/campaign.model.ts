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