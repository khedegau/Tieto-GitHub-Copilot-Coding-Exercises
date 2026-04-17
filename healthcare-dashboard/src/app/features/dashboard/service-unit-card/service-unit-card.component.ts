import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { OperationalSnapshot } from '../../../core/models';

@Component({
  selector: 'app-service-unit-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule],
  templateUrl: './service-unit-card.component.html',
  styleUrl: './service-unit-card.component.scss',
})
export class ServiceUnitCardComponent {
  @Input({ required: true }) snapshot!: OperationalSnapshot;

  get returnVisitRate(): string {
    if (this.snapshot.encounterCount === 0) return '0.0%';
    const rate = (this.snapshot.returnVisitCount / this.snapshot.encounterCount) * 100;
    return `${rate.toFixed(1)}%`;
  }

  get badgeClass(): string {
    switch (this.snapshot.capacityStatus) {
      case 'OVER_CAPACITY': return 'badge--red';
      case 'AT_CAPACITY': return 'badge--amber';
      case 'UNDER_CAPACITY': return 'badge--green';
    }
  }
}
