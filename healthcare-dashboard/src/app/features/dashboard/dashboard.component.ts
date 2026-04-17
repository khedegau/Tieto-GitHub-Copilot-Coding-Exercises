import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { toSignal } from '@angular/core/rxjs-interop';
import { CapacityStatus, OperationalSnapshot } from '../../core/models';
import { OperationalSnapshotService } from '../../core/services/operational-snapshot.service';
import { ServiceUnitCardComponent } from './service-unit-card/service-unit-card.component';

export type CapacityFilter = 'ALL' | CapacityStatus;
export type SortKey = 'demand' | 'returnVisitRate';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatSelectModule, MatFormFieldModule, ServiceUnitCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly snapshotService = inject(OperationalSnapshotService);

  readonly filterOptions: CapacityFilter[] = [
    'ALL',
    'OVER_CAPACITY',
    'AT_CAPACITY',
    'UNDER_CAPACITY',
  ];

  readonly sortOptions: { value: SortKey; label: string }[] = [
    { value: 'demand', label: 'Demand (desc)' },
    { value: 'returnVisitRate', label: 'Return-Visit Rate (desc)' },
  ];

  readonly activeFilter = signal<CapacityFilter>('ALL');
  readonly activeSort = signal<SortKey>('demand');

  private readonly allSnapshots = toSignal(
    this.snapshotService.getLatestPerUnit(),
    { initialValue: [] }
  );

  readonly filteredSnapshots = computed(() => {
    const filter = this.activeFilter();
    const sort = this.activeSort();
    const snapshots = this.allSnapshots();

    const filtered = filter === 'ALL'
      ? snapshots
      : snapshots.filter(s => s.capacityStatus === filter);

    return [...filtered].sort((a, b) =>
      sort === 'demand'
        ? b.demand - a.demand
        : this.returnVisitRate(b) - this.returnVisitRate(a)
    );
  });

  private returnVisitRate(s: OperationalSnapshot): number {
    return s.encounterCount === 0 ? 0 : s.returnVisitCount / s.encounterCount;
  }

  setFilter(filter: CapacityFilter): void {
    this.activeFilter.set(filter);
  }

  setSort(sort: SortKey): void {
    this.activeSort.set(sort);
  }
}
