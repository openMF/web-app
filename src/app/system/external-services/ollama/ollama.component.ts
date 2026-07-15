/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { SettingsService } from 'app/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mifosx-ollama',
  templateUrl: './ollama.component.html',
  styleUrls: ['./ollama.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    RouterLink,
    MatIconModule,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OllamaComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private translateService = inject(TranslateService);

  displayedColumns: string[] = [
    'name',
    'value'
  ];
  dataSource: MatTableDataSource<{ name: string; value: string }>;
  enabled = false;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.enabled = this.settingsService.ollamaEnabled;
    const rows = [
      {
        name: 'enabled',
        value: this.translateService.instant(
          this.settingsService.ollamaEnabled ? 'labels.inputs.Enabled' : 'labels.inputs.Disabled'
        )
      },
      { name: 'url', value: this.settingsService.ollamaUrl || '—' },
      { name: 'model', value: this.settingsService.ollamaModel || '—' }
    ];
    this.dataSource = new MatTableDataSource(rows);
    this.dataSource.sort = this.sort;
  }
}
