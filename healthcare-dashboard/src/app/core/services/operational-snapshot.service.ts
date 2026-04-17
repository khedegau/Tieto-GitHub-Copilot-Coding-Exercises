import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { OperationalSnapshot, ServiceUnit } from '../models';

interface SnapshotsResponse {
  operationalSnapshots: OperationalSnapshot[];
}

@Injectable({ providedIn: 'root' })
export class OperationalSnapshotService {
  private readonly http = inject(HttpClient);
  private readonly url = '/assets/data/operational-snapshots.json';

  private readonly all$: Observable<OperationalSnapshot[]> = this.http
    .get<SnapshotsResponse>(this.url)
    .pipe(
      map(r => r.operationalSnapshots),
      shareReplay(1)
    );

  getAll(): Observable<OperationalSnapshot[]> {
    return this.all$;
  }

  getLatestPerUnit(): Observable<OperationalSnapshot[]> {
    return this.all$.pipe(
      map(snapshots => {
        const latestByUnit = new Map<ServiceUnit, OperationalSnapshot>();
        for (const s of snapshots) {
          const existing = latestByUnit.get(s.serviceUnit);
          if (!existing || s.recordedAt > existing.recordedAt) {
            latestByUnit.set(s.serviceUnit, s);
          }
        }
        return Array.from(latestByUnit.values());
      })
    );
  }

  getByUnit(unit: ServiceUnit): Observable<OperationalSnapshot[]> {
    return this.all$.pipe(
      map(snapshots =>
        snapshots
          .filter(s => s.serviceUnit === unit)
          .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
      )
    );
  }
}
