import { inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Submarine } from '../models/submarine.model';

@Injectable({
  providedIn: 'root',
})
export class SubmarineService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = '/api/v1/submarines';

  getSubmarines(): Observable<Submarine[]> {
    return this.http.get<Submarine[]>(this.baseUrl);
  }

  getSubmarineById(id: number): Observable<Submarine> {
    return this.http.get<Submarine>(`${this.baseUrl}/${id}`);
  }
}
