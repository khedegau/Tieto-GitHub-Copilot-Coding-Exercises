import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { KpiBarComponent } from './shared/kpi-bar/kpi-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, KpiBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
