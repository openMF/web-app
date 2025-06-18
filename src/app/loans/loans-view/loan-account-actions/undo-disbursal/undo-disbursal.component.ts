/** Angular Imports */
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { LoansService } from '../../../loans.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Undo Disbursal component.
 */
@Component({
  selector: 'mifosx-undo-disbursal',
  templateUrl: './undo-disbursal.component.html',
  styleUrls: ['./undo-disbursal.component.scss'],
  imports: [
    MatCard,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    CdkTextareaAutosize,
    ReactiveFormsModule,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class UndoDisbursalComponent implements OnInit {
  @Input() actionName: string;

  /** Loan ID. */
  loanId: any;
  /** Undo disbursal form. */
  note: UntypedFormControl;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loansService Loans Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private loansService: LoansService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  /**
   * Creates the undo disbursal form.
   */
  ngOnInit() {
    this.note = this.formBuilder.control('', Validators.required);
  }

  /**
   * Submits the undo disbursal form.
   */
  submit() {
    let command = 'undodisbursal';
    if (this.actionName === 'Undo Last Disbursal') {
      command = 'undolastdisbursal';
    }
    this.loansService.loanActionButtons(this.loanId, command, { note: this.note.value }).subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}
