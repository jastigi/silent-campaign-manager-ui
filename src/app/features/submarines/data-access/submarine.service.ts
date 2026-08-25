import { inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Submarine, SubmarineRequest } from '../models/submarine.model';

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

  createSubmarine(request: SubmarineRequest): Observable<Submarine> {
    return this.http.post<Submarine>(this.baseUrl, request);
  }

  updateSubmarine(id: number, request: SubmarineRequest): Observable<Submarine> {
    return this.http.put<Submarine>(`${this.baseUrl}/${id}`, request);
  }

  deleteSubmarine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
