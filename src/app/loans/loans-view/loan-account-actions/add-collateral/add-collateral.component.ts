/** Angular Imports. */
import { Component, OnInit, Input, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Add Collateral component.
 */
@Component({
  selector: 'mifosx-add-collateral',
  templateUrl: './add-collateral.component.html',
  styleUrls: ['./add-collateral.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class AddCollateralComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loanService = inject(LoansService);

  @Input() dataObject: any;

  /** Collateral form. */
  collateralForm: UntypedFormGroup;
  /** Loan Id. */
  loanId: string;

  ngOnInit() {
    this.createAddCollateralForm();
  }

  /**
   * Set Collateral form.
   */
  createAddCollateralForm() {
    this.collateralForm = this.formBuilder.group({
      collateralTypeId: [
        '',
        Validators.required
      ],
      value: [
        '',
        Validators.required
      ],
      description: ['']
    });
  }

  /**
   * Submits collateral form.
   */
  submit() {
    const collateralTypeId = this.collateralForm.value.collateralTypeId;
    this.collateralForm.patchValue({
      collateralTypeId: collateralTypeId
    });
    const loanId = this.route.snapshot.params['loanId'];
    const collateralForm = this.collateralForm.value;
    collateralForm.locale = 'en';
    this.loanService.createLoanCollateral(loanId, collateralForm).subscribe((response: any) => {
      this.router.navigate(['../../loan-collateral'], { relativeTo: this.route });
    });
  }
}
