/** Angular Imports. */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';
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
  private loanService = inject(LoansService);
  private formBuilder = inject(UntypedFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Form Controller. */
  note: UntypedFormControl;

  ngOnInit() {
    this.note = this.formBuilder.control('');
  }

  /**
   * Submits undo approval form.
   */
  submit() {
    const loanId = this.route.snapshot.params['loanId'];
    this.loanService.loanActionButtons(loanId, 'undoapproval', { note: this.note.value }).subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}
