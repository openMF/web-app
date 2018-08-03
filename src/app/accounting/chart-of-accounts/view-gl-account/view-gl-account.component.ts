import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'mifosx-view-gl-account',
  templateUrl: './view-gl-account.component.html',
  styleUrls: ['./view-gl-account.component.scss']
})
export class ViewGlAccountComponent implements OnInit {

  glAccount: any;

  constructor(private route: ActivatedRoute,
              private accountingService: AccountingService,
              private router: Router,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { glAccount: any }) => {
      this.glAccount = data.glAccount;
    });
  }

  ngOnInit() {
  }

  deleteGlAccount() {
    // TODO: (Validation) gl account cannot be deleted if it has transactions logged against it
    const deleteGlAccountDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `gl account ${this.glAccount.id}` }
    });
    deleteGlAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.accountingService.deleteGlAccount(this.glAccount.id)
          .subscribe(() => {
            this.router.navigate(['/accounting/chart-of-accounts']);
          });
      }
    });
  }

  changeGlAccountState() {
    this.accountingService.updateGlAccount(this.glAccount.id, { disabled: !this.glAccount.disabled })
      .subscribe((response: any) => {
        this.glAccount.disabled = response.changes.disabled;
      });
  }

}
