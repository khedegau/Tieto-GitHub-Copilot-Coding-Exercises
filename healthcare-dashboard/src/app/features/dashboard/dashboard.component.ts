import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { toSignal } from '@angular/core/rxjs-interop';
import { CapacityStatus } from '../../core/models';
import { OperationalSnapshotService } from '../../core/services/operational-snapshot.service';
import { ServiceUnitCardComponent } from './service-unit-card/service-unit-card.component';

export type CapacityFilter = 'ALL' | CapacityStatus;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, ServiceUnitCardComponent],
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

  readonly activeFilter = signal<CapacityFilter>('ALL');

  private readonly allSnapshots = toSignal(
    this.snapshotService.getLatestPerUnit(),
    { initialValue: [] }
  );

  readonly filteredSnapshots = computed(() => {
    const filter = this.activeFilter();
    const snapshots = this.allSnapshots();
    return filter === 'ALL'
      ? snapshots
      : snapshots.filter(s => s.capacityStatus === filter);
  });

  setFilter(filter: CapacityFilter): void {
    this.activeFilter.set(filter);
  }
}
