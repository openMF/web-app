/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
/**
 * Undo Loan component.
 */
@Component({
  selector: 'mifosx-undo-approval',
  templateUrl: './undo-approval.component.html',
  styleUrls: ['./undo-approval.component.scss'],
  imports: [
    MatCard,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
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
    this.loanService.loanActionButtons(loanId, 'undoapproval', { note: this.note.value }).subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}
