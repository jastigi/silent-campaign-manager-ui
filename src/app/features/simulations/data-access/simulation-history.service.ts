import { inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { PageResponse } from '../../campaigns/models/page-response.model';

import { SimulationHistoryRecord } from '../models/simulation-history.model';

@Injectable({
  providedIn: 'root',
})
export class SimulationHistoryService {
  private readonly http = inject(HttpClient);

  getHistory(page: number, size: number): Observable<PageResponse<SimulationHistoryRecord>> {
    return this.http.get<PageResponse<SimulationHistoryRecord>>('/api/v1/simulations/history', {
      params: {
        page,
        size,
        sort: 'recordedAt,desc',
      },
    });
  }
}