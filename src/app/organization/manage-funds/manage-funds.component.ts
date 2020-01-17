/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { OrganizationService } from '../organization.service';
import { EditFundsDialogComponent } from '../edit-funds-dialog/edit-funds-dialog.component';

/**
 * Manage Funds component.
 */
@Component({
  selector: 'mifosx-manage-funds',
  templateUrl: './manage-funds.component.html',
  styleUrls: ['./manage-funds.component.scss']
})
export class ManageFundsComponent implements OnInit {

  /** Manage Funds data. */
  fundsData: any;
  /** New Fund form */
  fundForm: any;
  @ViewChild('formRef') formRef: any;

  /**
   * Retrieves the manage funds data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private organizationservice: OrganizationService,
    public dialog: MatDialog) {
    this.route.data.subscribe(( data: { funds: any }) => {
      this.fundsData = data.funds;
    });
  }

  ngOnInit() {
    this.createFundForm();
  }

  createFundForm() {
    this.fundForm = this.formBuilder.group({
      'name': ['', Validators.required]
    });
  }

  addFund() {
    this.organizationservice.createFund(this.fundForm.value).subscribe((response: any) => {
        this.fundsData.push({
        id: response.resourceId,
        name: this.fundForm.value.name
      });
      this.formRef.resetForm();
    });
  }

  editFund(fundId: string, name: string, index: number) {
    const editFundDialogRef = this.dialog.open(EditFundsDialogComponent, {
      data: { name: name }
    });
    editFundDialogRef.afterClosed().subscribe((response: { editForm: any }) => {
      if (response.editForm) {
        this.organizationservice.editFund(fundId, response.editForm.value).subscribe(() => {
          this.fundsData[index].name = response.editForm.value.name;
        });
      }
    });
  }

}
