import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';

@Component({
  selector: 'mifosx-create-fund',
  templateUrl: './create-fund.component.html',
  styleUrls: ['./create-fund.component.scss']
})
export class CreateFundComponent implements OnInit {

  /** Charge form. */
  fundForm: FormGroup;
  /** GL Accounts */
  glAccountOptions: any;

  /**
   * Retrieves the charge data from `resolve`.
   * @param {ProductsService} productsService Products Service.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private organizationService: OrganizationService,
              private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute) {
    this.route.data.subscribe((data: { glAccounts: any }) => {
      this.glAccountOptions = data.glAccounts.filter((glAccount: any) => {
        return (glAccount.type.value === 'ASSET' || glAccount.type.value === 'LIABILITY');
      });
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
      'name': ['', Validators.required],
      'externalId': [''],
      'isActive': [true],
      'glAccountId': ['', Validators.required]
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
