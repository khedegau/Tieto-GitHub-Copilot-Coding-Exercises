import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';
import { MatCardModule } from '@angular/material/card';

import { OperationalSnapshotService } from '../../core/services/operational-snapshot.service';
import { PipelineFreshnessService } from '../../core/services/pipeline-freshness.service';

@Component({
  selector: 'app-kpi-bar',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './kpi-bar.component.html',
  styleUrl: './kpi-bar.component.scss',
})
export class KpiBarComponent {
  private readonly snapshotService = inject(OperationalSnapshotService);
  private readonly pipelineService = inject(PipelineFreshnessService);

  private readonly latestSnapshots = toSignal(this.snapshotService.getLatestPerUnit(), { initialValue: [] });
  private readonly summary = toSignal(this.pipelineService.getSummary(), {
    initialValue: { fresh: 0, stale: 0, missing: 0, total: 0 },
  });

  readonly totalEncounters = computed(() =>
    this.latestSnapshots().reduce((sum, s) => sum + s.encounterCount, 0)
  );

  readonly overCapacityCount = computed(() =>
    this.latestSnapshots().filter(s => s.capacityStatus === 'OVER_CAPACITY').length
  );

  readonly pipelineScoreText = computed(() => {
    const s = this.summary();
    return `${s.fresh} of ${s.total} sources FRESH`;
  });

  readonly isPipelineAlert = computed(() => this.summary().missing > 0);
}
