import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { PipelineFreshness } from '../models';

export interface PipelineSummary {
  fresh: number;
  stale: number;
  missing: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class PipelineFreshnessService {
  private readonly http = inject(HttpClient);
  private readonly url = '/assets/data/pipeline-freshness.json';

  private readonly all$: Observable<PipelineFreshness[]> = this.http
    .get<PipelineFreshness[]>(this.url)
    .pipe(shareReplay(1));

  getAll(): Observable<PipelineFreshness[]> {
    return this.all$;
  }

  getSummary(): Observable<PipelineSummary> {
    return this.all$.pipe(
      map(pipelines => ({
        fresh: pipelines.filter(p => p.status === 'FRESH').length,
        stale: pipelines.filter(p => p.status === 'STALE').length,
        missing: pipelines.filter(p => p.status === 'MISSING').length,
        total: pipelines.length,
      }))
    );
  }
}
