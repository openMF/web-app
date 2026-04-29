/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services. */
import { LoansService } from '@fineract/client';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
/**
 * Undo Loan component.
 */
@Component({
  selector: 'mifosx-undo-approval',
  templateUrl: './undo-approval.component.html',
  styleUrls: ['./undo-approval.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class UndoApprovalComponent implements OnInit {
  /** Form Controller. */
  note: UntypedFormControl;

  /**
   * @param loanService Loan Service.
   * @param route Activated Route.
   * @param router Router.
   */
  constructor(
    private loanService: LoansService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.note = this.formBuilder.control('');
  }

  /**
   * Submits undo approval form.
   */
  submit() {
    const loanId = this.route.snapshot.params['loanId'];
    this.loanService
      .stateTransitions({
        loanId: Number(loanId),
        postLoansLoanIdRequest: { note: this.note.value },
        command: 'undoapproval'
      })
      .subscribe((response: any) => {
        this.router.navigate(['../../general'], { relativeTo: this.route });
      });
  }
}
