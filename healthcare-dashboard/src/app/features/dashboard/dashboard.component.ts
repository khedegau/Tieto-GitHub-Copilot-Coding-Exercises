import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { OperationalSnapshotService } from '../../core/services/operational-snapshot.service';
import { ServiceUnitCardComponent } from './service-unit-card/service-unit-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ServiceUnitCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly snapshotService = inject(OperationalSnapshotService);

  readonly latestSnapshots = toSignal(
    this.snapshotService.getLatestPerUnit(),
    { initialValue: [] }
  );
}
