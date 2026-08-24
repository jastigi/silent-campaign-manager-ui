export type CampaignTimelineEventType =
  | 'CAMPAIGN_EXECUTION_STARTED'
  | 'CAMPAIGN_EXECUTION_COMPLETED'
  | 'CAMPAIGN_EXECUTION_FAILED'
  | 'PATROL_COMPLETED';

export interface CampaignTimelineEvent {
  timestamp: string;
  type: CampaignTimelineEventType;
  description: string;
}