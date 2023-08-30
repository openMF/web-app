import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';

@Component({
  selector: 'mifosx-edit-fund',
  templateUrl: './edit-fund.component.html',
  styleUrls: ['./edit-fund.component.scss']
})
export class EditFundComponent implements OnInit {

  /** Selected Data. */
  fundData: any;
  /** Charge form. */
  fundForm: UntypedFormGroup;

  /**
   * Retrieves the charge data from `resolve`.
   * @param {ProductsService} productsService Products Service.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private organizationService: OrganizationService,
              private formBuilder: UntypedFormBuilder,
              private router: Router,
              private route: ActivatedRoute) {
    this.route.data.subscribe((data: { fundData: any }) => {
      this.fundData = data.fundData;
    });
  }

  ngOnInit() {
    this.createFundForm();
  }

  /**
   * Edit Fund form.
   */
  createFundForm() {
    this.fundForm = this.formBuilder.group({
      'name': [this.fundData.name, Validators.required],
      'externalId': [this.fundData.externalId]
    });
  }


  submit() {
    const payload = this.fundForm.getRawValue();
    this.organizationService.editFund(this.fundData.id.toString(), payload)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
