/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { ClientFamilyMemberDialogComponent } from '../../client-stepper/client-family-members-step/client-family-member-dialog/client-family-member-dialog.component';
import { Observable, map, of, switchMap } from 'rxjs';

/** Custom Services */
import { ClientsService } from '../../clients.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatFooterCellDef,
  MatFooterCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
  MatFooterRowDef,
  MatFooterRow
} from '@angular/material/table';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AdToBsPipe } from 'app/pipes/ad-to-bs.pipe';

/**
 * Client Family Members Tab
 */
@Component({
  selector: 'mifosx-family-members-tab',
  templateUrl: './family-members-tab.component.html',
  styleUrls: ['./family-members-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterOutlet,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatFooterCellDef,
    MatFooterCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatFooterRowDef,
    MatFooterRow,
    YesnoPipe,
    AdToBsPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FamilyMembersTabComponent {
  private route = inject(ActivatedRoute);
  private clientsService = inject(ClientsService);
  dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  /** Client Family Members */
  clientFamilyMembers: any;
  /** Table columns, in order. */
  familyMemberColumns = [
    'sno',
    'name',
    'relationship',
    'gender',
    'dateOfBirth',
    'age',
    'actions'
  ];
  /** The row whose other details are showing; one at a time. */
  expandedMember: any = null;
  /** Relationship, gender, profession and marital status lists, loaded on the first edit. */
  private familyMemberOptions: any;

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {ClientsService} clientsService Clients Service
   * @param {MatDialog }dialog Mat Dialog
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientFamilyMembers: any }) => {
      this.clientFamilyMembers = data.clientFamilyMembers;
    });
  }

  /** Adds a family member in a dialog. */
  addFamilyMember() {
    this.openFamilyMemberDialog(null, (data) => this.clientsService.addFamilyMember(this.clientId, data));
  }

  /** Edits a family member in a dialog. */
  editFamilyMember(member: any) {
    this.openFamilyMemberDialog(member, (data) =>
      this.clientsService.editFamilyMember(member.clientId, member.id, data)
    );
  }

  /**
   * Opens the family member dialog (blank to add, filled to edit), saves what it returns and reloads
   * the list, which shows the option names (relationship, gender ...) the dialog only has ids for.
   */
  private openFamilyMemberDialog(member: any, save: (data: any) => Observable<unknown>) {
    const options$: Observable<any> = this.familyMemberOptions
      ? of(this.familyMemberOptions)
      : this.clientsService
          .getClientTemplate()
          // map, not tap: the dialog needs the family-member options, not the whole client template.
          .pipe(map((template: any) => (this.familyMemberOptions = template.familyMemberOptions)));
    options$
      .pipe(
        switchMap(
          (options) =>
            this.dialog
              .open(ClientFamilyMemberDialogComponent, {
                data: member ? { context: 'Edit', member, options } : { context: 'Add', options },
                width: '52rem'
              })
              .afterClosed() as Observable<any>
        ),
        switchMap((response) =>
          response?.member
            ? save(response.member).pipe(switchMap(() => this.clientsService.getClientFamilyMembers(this.clientId)))
            : of(null)
        )
      )
      .subscribe((members) => {
        if (members) {
          this.clientFamilyMembers = members;
          this.cdr.markForCheck();
        }
      });
  }

  /** The member's id, from the member page's route (/members/:clientId/...). */
  private get clientId(): string {
    return this.route.snapshot.pathFromRoot.find((route) => route.paramMap.has('clientId'))?.paramMap.get('clientId');
  }

  /** Opens a row's other details, or closes them if open. */
  toggleMember(member: any) {
    this.expandedMember = this.expandedMember === member ? null : member;
  }

  /** Age in years: the stored age, or worked out from the date of birth when it is stored as 0. */
  ageOf(member: any): number | null {
    if (member.age > 0) {
      return member.age;
    }
    const dob = member.dateOfBirth;
    if (!dob) {
      return null;
    }
    const born = Array.isArray(dob) ? new Date(dob[0], dob[1] - 1, dob[2]) : new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - born.getFullYear();
    if (today < new Date(today.getFullYear(), born.getMonth(), born.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  }

  /**
   * Deletes the family member and redirects to family members tab.
   */
  deleteFamilyMember(clientId: string, id: string, name: string, index: number) {
    const deleteFamilyMemberDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Family member id:${id} name : ${name} ${index}` }
    });
    deleteFamilyMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientsService.deleteFamilyMember(clientId, id).subscribe(() => {
          // A new array, so the table redraws without the deleted row.
          this.clientFamilyMembers = this.clientFamilyMembers.filter((_: any, i: number) => i !== index);
          this.cdr.markForCheck();
        });
      }
    });
  }

  displayName(member: any): string {
    let fullName: string = member.firstName;
    if (member.middleName) {
      fullName = fullName + ' ' + member.middleName;
    }
    if (member.lastName) {
      fullName = fullName + ' ' + member.lastName;
    }
    return fullName;
  }
}
