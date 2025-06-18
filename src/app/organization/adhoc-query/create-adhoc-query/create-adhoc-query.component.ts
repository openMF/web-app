/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf, NgFor } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Create Adhoc Query component.
 */
@Component({
  selector: 'mifosx-create-adhoc-query',
  templateUrl: './create-adhoc-query.component.html',
  styleUrls: ['./create-adhoc-query.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    NgIf,
    MatError,
    MatSelect,
    NgFor,
    MatOption,
    MatCheckbox,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class CreateAdhocQueryComponent implements OnInit {
  /** Adhoc Query form. */
  adhocQueryForm: UntypedFormGroup;
  /** Adhoc Query template data. */
  adhocQueryTemplateData: any;
  /** Report run frequencies data. */
  reportRunFrequencyData: any;

  /**
   * Retrieves the adhoc query template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { adhocQueryTemplate: any }) => {
      this.adhocQueryTemplateData = data.adhocQueryTemplate;
    });
  }

  /**
   * Creates the adhoc query form and sets the conditional controls of the adhoc query form.
   */
  ngOnInit() {
    this.createAdhocQueryForm();
    this.setConditionalControls();
  }

  /**
   * Creates the adhoc query form.
   */
  createAdhocQueryForm() {
    this.reportRunFrequencyData = this.adhocQueryTemplateData.reportRunFrequencies;
    this.adhocQueryForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ],
      query: [
        '',
        Validators.required
      ],
      tableName: [
        '',
        Validators.required
      ],
      tableFields: [
        '',
        Validators.required
      ],
      email: [
        '',
        Validators.email
      ],
      reportRunFrequency: [''],
      isActive: [false]
    });
  }

  /**
   * Sets the conditional controls of the adhoc query form
   */
  setConditionalControls() {
    this.adhocQueryForm.get('reportRunFrequency').valueChanges.subscribe((reportRunFrequencyId) => {
      if (reportRunFrequencyId === 5) {
        this.adhocQueryForm.addControl(
          'reportRunEvery',
          new UntypedFormControl('', [
            Validators.required,
            Validators.min(1)])
        );
      } else {
        this.adhocQueryForm.removeControl('reportRunEvery');
      }
    });
  }

  /**
   * Submits the adhoc query form and creates adhoc query,
   * if successful redirects to view adhoc query.
   */
  submit() {
    this.organizationService.createAdhocQuery(this.adhocQueryForm.value).subscribe((response: any) => {
      this.router.navigate(
        [
          '../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}
