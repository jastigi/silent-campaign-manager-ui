import {
  inject,
  Injectable
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  Campaign
} from '../models/campaign.model';

import {
  PageResponse
} from '../models/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  private readonly http =
    inject(HttpClient);

  private readonly baseUrl =
    '/api/v1/campaigns';

  getCampaigns(
    page = 0,
    size = 10,
    sortBy = 'id',
    direction = 'asc'
  ): Observable<PageResponse<Campaign>> {

    const params =
      new HttpParams()
        .set(
          'page',
          page
        )
        .set(
          'size',
          size
        )
        .set(
          'sortBy',
          sortBy
        )
        .set(
          'direction',
          direction
        );

    return this.http.get<
      PageResponse<Campaign>
    >(
      this.baseUrl,
      {
        params
      }
    );
  }

}