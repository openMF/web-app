/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatIconButton } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTable,
  MatTableDataSource,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatCell,
  MatCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateService } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { of } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';

import { ClientsService } from 'app/clients/clients.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { UsersService } from '../users.service';

@Component({
  selector: 'mifosx-self-service-users',
  templateUrl: './self-service-users.component.html',
  styleUrls: ['./self-service-users.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ReactiveFormsModule,
    FaIconComponent,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatIconButton,
    MatPaginator,
    MatSort,
    MatSortHeader,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTooltip
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelfServiceUsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private clientsService = inject(ClientsService);
  private dialog = inject(MatDialog);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);

  displayedColumns: string[] = [
    'username',
    'name',
    'officeName',
    'clients',
    'status',
    'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);
  clientChoice = new UntypedFormControl('');
  clientsData: any[] = [];
  selectedUser: any;
  loading = false;
  mutatingUserId: number | null = null;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (user: any, property: string) => {
      switch (property) {
        case 'name':
          return this.getName(user).toLowerCase();
        case 'status':
          return user.enabled === true ? 'active' : 'inactive';
        case 'username':
          return (user.username || '').toLowerCase();
        case 'officeName':
          return (user.officeName || '').toLowerCase();
        default:
          return user[property];
      }
    };
    this.dataSource.filterPredicate = (user: any, filter: string) =>
      [
        user.username,
        this.getName(user),
        user.officeName,
        this.getLinkedClients(user)
      ]
        .join(' ')
        .toLowerCase()
        .includes(filter);
    this.clientChoice.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value: string | any) => this.searchClients(value)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((data: any) => {
        this.clientsData = data.pageItems || [];
        this.changeDetectorRef.markForCheck();
      });
    this.loadUsers();
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService
      .getSelfServiceUsers()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe((users: any[]) => {
        this.dataSource.data = users || [];
        this.changeDetectorRef.markForCheck();
      });
  }

  getName(user: any): string {
    return [
      user.firstname,
      user.middleName,
      user.lastname
    ]
      .filter(Boolean)
      .join(' ');
  }

  getLinkedClients(user: any): string {
    return this.getClients(user)
      .map((client: any) => client.displayName || client.name || client.id)
      .join(', ');
  }

  getClients(user: any): any[] {
    return Array.isArray(user.clients) ? user.clients : Array.from(user.clients || []);
  }

  isActive(user: any): boolean {
    return user.enabled === true;
  }

  displayClient(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  openLinkClient(user: any): void {
    this.selectedUser = user;
    this.clientChoice.reset('');
    this.clientsData = [];
  }

  activate(user: any): void {
    this.mutate(user, () => this.usersService.activateSelfServiceUser(user.id));
  }

  inactivate(user: any): void {
    this.confirm(
      'labels.heading.Inactivate Self Service User',
      'labels.text.Self service user will no longer be able to sign in',
      'warn',
      { username: user.username },
      () => this.mutate(user, () => this.usersService.inactivateSelfServiceUser(user.id))
    );
  }

  linkClient(): void {
    const client = this.clientChoice.value;
    if (!this.selectedUser || !client?.id) {
      return;
    }
    this.mutate(this.selectedUser, () => this.usersService.linkSelfServiceUserClient(this.selectedUser.id, client.id));
    this.selectedUser = null;
  }

  delinkClient(user: any, client: any): void {
    this.confirm(
      'labels.heading.Delink Client',
      'labels.text.Client will be removed from self service user',
      'warn',
      { clientName: client.displayName || client.id, username: user.username },
      () => this.mutate(user, () => this.usersService.delinkSelfServiceUserClient(user.id, client.id))
    );
  }

  delete(user: any): void {
    this.confirm(
      'labels.heading.Delete Self Service User',
      'labels.text.Self service user will no longer be usable',
      'delete',
      { username: user.username },
      () => this.mutate(user, () => this.usersService.deleteSelfServiceUser(user.id))
    );
  }

  private searchClients(value: string | any) {
    if (typeof value !== 'string' || value.length < 2) {
      return of({ pageItems: [] });
    }
    return this.clientsService.getFilteredClients('displayName', 'ASC', false, value);
  }

  private mutate(user: any, request: () => any): void {
    this.mutatingUserId = user.id;
    request()
      .pipe(
        finalize(() => {
          this.mutatingUserId = null;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe(() => this.loadUsers());
  }

  private confirm(
    headingKey: string,
    dialogContextKey: string,
    type: string,
    params: any,
    confirmed: () => void
  ): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant(headingKey, params),
        dialogContext: this.translateService.instant(dialogContextKey, params),
        type
      }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response?.confirm) {
        confirmed();
      }
    });
  }
}
