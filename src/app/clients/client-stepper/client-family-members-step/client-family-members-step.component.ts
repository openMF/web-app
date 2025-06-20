/** Angular Imports */
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { ClientFamilyMemberDialogComponent } from './client-family-member-dialog/client-family-member-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
  MatExpansionPanelDescription
} from '@angular/material/expansion';
import { MatDivider } from '@angular/material/divider';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FindPipe } from '../../../pipes/find.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Client Family Members Step
 */
@Component({
  selector: 'mifosx-client-family-members-step',
  templateUrl: './client-family-members-step.component.html',
  styleUrls: ['./client-family-members-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatDivider,
    MatStepperPrevious,
    MatStepperNext,
    FindPipe,
    DateFormatPipe
  ]
})
export class ClientFamilyMembersStepComponent {
  /** Cient Template */
  @Input() clientTemplate: any;
  /** Client Family Members */
  clientFamilyMembers: any[] = [];

  /**
   * @param {MatDialog} dialog Mat Dialog
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  /**
   * Adds a family member.
   */
  addFamilyMember() {
    const addFamilyMemberDialogRef = this.dialog.open(ClientFamilyMemberDialogComponent, {
      data: {
        context: this.translateService.instant('labels.buttons.Add'),
        options: this.clientTemplate.familyMemberOptions
      },
      width: '50rem'
    });
    addFamilyMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.member) {
        this.clientFamilyMembers.push(response.member);
      }
    });
  }

  /**
   * Edits the family member.
   * @param {any} member Family Member
   * @param {any} index Tree Index
   */
  editFamilyMember(member: any, index: any) {
    const addFamilyMemberDialogRef = this.dialog.open(ClientFamilyMemberDialogComponent, {
      data: {
        context: 'Edit',
        member: member,
        options: this.clientTemplate.familyMemberOptions
      },
      width: '50rem'
    });
    addFamilyMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.member) {
        this.clientFamilyMembers.splice(index, 1, response.member);
      }
    });
  }

  /**
   * Deletes the family member
   */
  deleteFamilyMember(name: string, index: number) {
    const deleteFamilyMemberDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Family member name : ${name} ${index}` }
    });
    deleteFamilyMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientFamilyMembers.splice(index, 1);
      }
    });
  }

  /**
   * Returns the array of client family members.
   */
  get familyMembers() {
    return { familyMembers: this.clientFamilyMembers };
  }
}
