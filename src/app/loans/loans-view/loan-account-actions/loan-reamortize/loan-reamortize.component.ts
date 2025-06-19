import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoansService } from 'app/loans/loans.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-loan-reamortize',
  templateUrl: './loan-reamortize.component.html',
  styleUrls: ['./loan-reamortize.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class LoanReamortizeComponent implements OnInit {
  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** ReAmortize Loan Form */
  reamortizeLoanForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoansService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit(): void {
    this.createReAmortizeLoanForm();
  }

  createReAmortizeLoanForm() {
    this.reamortizeLoanForm = this.formBuilder.group({
      note: '',
      externalId: ''
    });
  }

  submit(): void {
    const data = this.reamortizeLoanForm.value;
    this.loanService.submitLoanActionButton(this.loanId, data, 'reAmortize').subscribe((response: any) => {
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }
}
