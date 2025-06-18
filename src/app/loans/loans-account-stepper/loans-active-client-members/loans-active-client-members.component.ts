import { Component, OnInit, Input } from '@angular/core';
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-loans-active-client-members',
  templateUrl: './loans-active-client-members.component.html',
  styleUrls: ['./loans-active-client-members.component.scss'],
  imports: [
    NgIf,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCheckbox,
    ReactiveFormsModule,
    FormsModule,
    MatCellDef,
    MatCell,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    MatInput,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatButton,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    RouterLink,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class LoansActiveClientMembersComponent implements OnInit {
  loanId: any = null;
  @Input() activeClientMembers?: any;
  @Input() loansAccountFormValid: boolean;

  constructor(private route: ActivatedRoute) {
    this.loanId = this.route.snapshot.params['loanId'];
  }
  dataSource: any;
  /** Check for select all the Clients List */
  selectAllItems = false;
  /** Loan Purpose Options */
  loanPurposeOptions: string[] = [];
  /** Table Displayed Columns */
  displayedColumn: string[] = [
    'check',
    'id',
    'name',
    'purpose',
    'amount'
  ];

  ngOnInit(): void {
    // console.log("Active Client Members in LoansActiveClientMembersComponent:", this.activeClientMembers);

    this.dataSource = new MatTableDataSource<any>(this.activeClientMembers);
  }

  get isValid() {
    // console.log("LoansActiveClientMembersComponent isValid:", this.selectedClientMembers?.selectedMembers?.reduce((acc: any, cur: any) => acc + (cur.principal ?? 0), 0) > 0);
    return (
      !this.activeClientMembers ||
      this.selectedClientMembers?.selectedMembers?.reduce((acc: any, cur: any) => acc + (cur.principal ?? 0), 0) > 0
    );
  }
  get selectedClientMembers() {
    return { selectedMembers: this.activeClientMembers.filter((item: any) => item.selected) };
  }

  /** Toggle all checks */
  toggleSelects() {
    for (const member of this.activeClientMembers) {
      member.selected = this.selectAllItems;
    }
  }

  /** Check if all the checks are selected */
  toggleSelect() {
    const len = this.activeClientMembers.length;
    this.selectAllItems =
      len === 0 ? false : this.activeClientMembers.filter((item: any) => item.selected).length === len;
  }
}
