/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatProgressBar } from '@angular/material/progress-bar';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { OrganizationService } from 'app/organization/organization.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FILE_STAGES, FileStage, LoanFileService, SLOW_AFTER_DAYS, WorkPage, WorkPageRow } from '../loan-file.service';

/** The loan officer filter: the signed-in officer's loans, everyone's, loans with no officer, or one officer's. */
const ME = 'me';
const EVERYONE = '';
const NONE = 'none';

/**
 * The lending work page (fineract-dbug #324): every loan waiting on staff, in three stages with their counts.
 * A loan officer starts on their own loans; anyone else starts on everyone's. Oldest in the stage first.
 */
@Component({
  selector: 'mifosx-lending-work-page',
  templateUrl: './work-page.component.html',
  styleUrls: ['./work-page.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatPaginator,
    MatProgressBar,
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkPageComponent implements OnInit {
  private files = inject(LoanFileService);
  private auth = inject(AuthenticationService);
  private organization = inject(OrganizationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly stages = FILE_STAGES;
  readonly slowAfter = SLOW_AFTER_DAYS;
  readonly ME = ME;
  readonly EVERYONE = EVERYONE;
  readonly NONE = NONE;
  readonly pageSizes = [
    10,
    25,
    50,
    100
  ];

  readonly stage = signal<FileStage>('DOCUMENTS');
  readonly page = signal<WorkPage>({ counts: { DOCUMENTS: 0, APPRAISAL: 0, APPROVED: 0 }, total: 0, rows: [] });
  readonly loading = signal(false);
  /** Whether the list could not be read (no access, or the server refused). */
  readonly failed = signal(false);
  readonly offices = signal<{ id: number; name: string }[]>([]);
  readonly officers = signal<{ id: number; displayName: string }[]>([]);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);

  /** A loan officer starts on their own loans. */
  private readonly hasStaffRecord = !!this.auth.getCredentials()?.staffId;
  readonly officer = new FormControl<string>(this.hasStaffRecord ? ME : EVERYONE);
  readonly office = new FormControl<number | null>(null);
  readonly search = new FormControl<string>('');

  get columns(): string[] {
    const base = [
      'clientName',
      'accountNo',
      'product',
      'amount',
      'officerName',
      'officeName',
      'registerNumber',
      'daysInStage'
    ];
    return this.stage() === 'DOCUMENTS' ? [
          ...base,
          'missing'
        ] : base;
  }

  ngOnInit(): void {
    this.organization
      .getOffices()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (offices: any[]) => this.offices.set(offices ?? []), error: () => this.offices.set([]) });
    this.organization
      .getEmployees()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (staff: any[]) => this.officers.set((staff ?? []).filter((s) => s.isLoanOfficer)),
        error: () => this.officers.set([])
      });

    this.officer.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
    this.office.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.reload());
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
    this.load();
  }

  chooseStage(stage: FileStage): void {
    if (stage && stage !== this.stage()) {
      this.stage.set(stage);
      this.reload();
    }
  }

  /** A new filter or stage starts again from the first page. */
  private reload(): void {
    this.pageIndex.set(0);
    this.load();
  }

  changePage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.files
      .workPage({
        stage: this.stage(),
        officer: this.officer.value || undefined,
        officeId: this.office.value,
        search: this.search.value ?? '',
        offset: this.pageIndex() * this.pageSize(),
        limit: this.pageSize()
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.page.set(page);
          this.failed.set(false);
          this.loading.set(false);
        },
        error: () => {
          this.page.update((p) => ({ ...p, rows: [], total: 0 }));
          this.failed.set(true);
          this.loading.set(false);
        }
      });
  }

  open(row: WorkPageRow): void {
    this.router.navigate([
      '/lending/files',
      row.loanId
    ]);
  }

  isSlow(row: WorkPageRow): boolean {
    return row.daysInStage > SLOW_AFTER_DAYS;
  }

  date(value: string | null): string {
    return this.files.bsDate(value);
  }
}
