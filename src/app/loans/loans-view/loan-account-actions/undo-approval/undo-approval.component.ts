/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';
/**
 * Undo Loan component.
 */
@Component({
  selector: 'mifosx-undo-approval',
  templateUrl: './undo-approval.component.html',
  styleUrls: ['./undo-approval.component.scss']
})
export class UndoApprovalComponent implements OnInit {

  /** Form Controller. */
  note: FormControl;

  /**
   * @param loanService Loan Service.
   * @param route Activated Route.
   * @param router Router.
   */
  constructor(private loanService: LoansService,
              private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.note = this.formBuilder.control('');
  }

  /**
   * Submits undo approval form.
   */
  submit() {
    const loanId = this.route.parent.snapshot.params['loanId'];
    this.loanService.loanActionButtons(loanId, 'undoapproval', { 'note': this.note.value }).subscribe((response: any) => {
      this.router.navigate(['../../general'], {relativeTo: this.route});
    });
  }

}
