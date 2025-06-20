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
import { MatCheckbox } from '@angular/material/checkbox';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loans-active-client-members',
  templateUrl: './loans-active-client-members.component.html',
  styleUrls: ['./loans-active-client-members.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCheckbox,
    FormsModule,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext
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
