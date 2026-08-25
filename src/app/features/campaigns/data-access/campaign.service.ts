import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Campaign, CampaignDetails, CampaignRequest } from '../models/campaign.model';

import { PageResponse } from '../models/page-response.model';

import { CampaignStatistics } from '../models/campaign-statistics.model';

import { CampaignTimelineEvent } from '../models/campaign-timeline.model';

import { CampaignExecution } from '../models/campaign-execution.model';

import { CampaignSimulationResult } from '../models/campaign-simulation.model';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = '/api/v1/campaigns';

  createCampaign(request: CampaignRequest): Observable<Campaign> {
    return this.http.post<Campaign>(this.baseUrl, request);
  }

  getCampaignById(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.baseUrl}/${id}`);
  }

  updateCampaign(id: number, request: CampaignRequest): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.baseUrl}/${id}`, request);
  }

  deleteCampaign(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getCampaigns(
    page = 0,
    size = 10,
    sortBy = 'id',
    direction = 'asc',
  ): Observable<PageResponse<Campaign>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<PageResponse<Campaign>>(this.baseUrl, {
      params,
    });
  }

  getCampaignDetails(id: number): Observable<CampaignDetails> {
    return this.http.get<CampaignDetails>(`${this.baseUrl}/${id}/details`);
  }

  getCampaignStatistics(id: number): Observable<CampaignStatistics> {
    return this.http.get<CampaignStatistics>(`${this.baseUrl}/${id}/statistics`);
  }

  getCampaignTimeline(id: number): Observable<CampaignTimelineEvent[]> {
    return this.http.get<CampaignTimelineEvent[]>(`${this.baseUrl}/${id}/timeline`);
  }

  getCampaignExecutions(
    id: number,
    page = 0,
    size = 10,
  ): Observable<PageResponse<CampaignExecution>> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<PageResponse<CampaignExecution>>(`${this.baseUrl}/${id}/executions`, {
      params,
    });
  }

  simulateCampaign(id: number): Observable<CampaignSimulationResult> {
    return this.http.post<CampaignSimulationResult>(`${this.baseUrl}/${id}/simulate`, null);
  }
}
