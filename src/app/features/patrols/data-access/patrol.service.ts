import { inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { MissionEvaluation, Patrol, PatrolReport, PatrolRequest } from '../models/patrol.model';

import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root',
})
export class PatrolService {
  private readonly http = inject(HttpClient);

  getPatrolReport(campaignId: number, patrolId: number): Observable<PatrolReport> {
    return this.http.get<PatrolReport>(
      `/api/v1/campaigns/${campaignId}/patrols/${patrolId}/report`,
    );
  }

  getPatrolContacts(campaignId: number, patrolId: number): Observable<Contact[]> {
    return this.http.get<Contact[]>(`/api/v1/campaigns/${campaignId}/patrols/${patrolId}/contacts`);
  }

  getMissionEvaluation(campaignId: number, patrolId: number): Observable<MissionEvaluation> {
    return this.http.get<MissionEvaluation>(
      `/api/v1/campaigns/${campaignId}/patrols/${patrolId}/evaluation`,
    );
  }

  closePatrol(campaignId: number, patrolId: number): Observable<Patrol> {
    return this.http.patch<Patrol>(`/api/v1/campaigns/${campaignId}/patrols/${patrolId}/close`, {});
  }

  createPatrol(campaignId: number, request: PatrolRequest): Observable<Patrol> {
    return this.http.post<Patrol>(`/api/v1/campaigns/${campaignId}/patrols`, request);
  }
}
