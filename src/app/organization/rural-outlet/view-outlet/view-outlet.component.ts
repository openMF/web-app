import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';
import { MatDialog } from '@angular/material/dialog';

import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { AlertService } from 'app/core/alert/alert.service';

@Component({
  selector: 'mifosx-view-outlet',
  templateUrl: './view-outlet.component.html',
  styleUrls: ['./view-outlet.component.scss'],
})
export class ViewOutletComponent  {
  retailOutletData: any;
  officeList: any;
  errMsg: string = undefined;
  constructor(private organizationService: OrganizationService,
    private route: ActivatedRoute, private dialog: MatDialog, private router: Router,
    private alertService: AlertService) {
    const outletId = +this.route.snapshot.paramMap.get('id');
    this.getRuralOutlet(outletId);
  }

  getRuralOutlet(outletId: number) {
    this.organizationService.getRuralOutletByOutletId(outletId).subscribe((res: any) => {
      this.retailOutletData = res;
      this.officeList = res?.offices.map(x => x.officeName).toString();
    });
  }

  deleteRuralOutlet() {
    const outletId = +this.route.snapshot.paramMap.get('id');
    const deleteOutletDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.retailOutletData.name }
    });
    deleteOutletDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deleteOutlet(outletId)
          .subscribe(() => {
            this.router.navigate(['../'], { relativeTo: this.route });
          } , error => {
            console.log(error);
            this.alertService.alert({ type: 'Deletion Error', message: 'Error while deleting rural outlet. Please try again.' });
          });
      }
    });
  }
}
