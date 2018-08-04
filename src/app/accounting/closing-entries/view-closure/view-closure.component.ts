import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { AccountingService } from '../../accounting.service';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-view-closure',
  templateUrl: './view-closure.component.html',
  styleUrls: ['./view-closure.component.scss']
})
export class ViewClosureComponent implements OnInit {

  accountingClosureId: number;
  accountingClosure: any;

  constructor(private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.accountingClosureId = Number(this.route.snapshot.paramMap.get('id'));
    this.getAccountingClosure();
  }

  getAccountingClosure() {
    this.accountingService.getAccountingClosure(this.accountingClosureId)
      .subscribe((accountingClosure: any) => {
        this.accountingClosure = accountingClosure;
      });
  }

  deleteAccountingClosure() {
    const deleteAccountingClosureDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `accounting closure ${this.accountingClosureId}` }
    });
    deleteAccountingClosureDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.accountingService.deleteAccountingClosure(this.accountingClosureId)
          .subscribe(() => {
            this.router.navigate(['/accounting/closing-entries']);
          });
      }
    });
  }

}
