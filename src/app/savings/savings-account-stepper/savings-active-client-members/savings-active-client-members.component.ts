import { Component, OnInit, OnChanges, Input } from '@angular/core';
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
import { MatCheckbox } from '@angular/material/checkbox';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-savings-active-client-members',
  templateUrl: './savings-active-client-members.component.html',
  styleUrls: ['./savings-active-client-members.component.scss'],
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
export class SavingsActiveClientMembersComponent implements OnInit {
  @Input() activeClientMembers?: any;
  selectAllItems = false;
  displayedColumn: string[] = [
    'check',
    'id',
    'name'
  ];

  constructor() {}

  dataSource: any;
  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<any>(this.activeClientMembers);
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
