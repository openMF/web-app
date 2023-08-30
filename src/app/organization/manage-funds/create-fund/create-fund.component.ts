import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';

@Component({
  selector: 'mifosx-create-fund',
  templateUrl: './create-fund.component.html',
  styleUrls: ['./create-fund.component.scss']
})
export class CreateFundComponent implements OnInit {

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
  }

  ngOnInit() {
    this.createFundForm();
  }

  /**
   * Edit Fund form.
   */
  createFundForm() {
    this.fundForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'externalId': ['']
    });
  }


  submit() {
    const payload = this.fundForm.getRawValue();
    this.organizationService.createFund(payload)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }


}
