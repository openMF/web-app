/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Edit Adhoc Query component.
 */
@Component({
  selector: 'mifosx-edit-adhoc-query',
  templateUrl: './edit-adhoc-query.component.html',
  styleUrls: ['./edit-adhoc-query.component.scss']
})
export class EditAdhocQueryComponent implements OnInit {

  /** Edit Adhoc Query form. */
  editAdhocQueryForm: FormGroup;
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
  constructor(private formBuilder: FormBuilder,
              private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { adhocQueryAndTemplate: any }) => {
      this.adhocQueryTemplateData = data.adhocQueryAndTemplate;
    });
  }

  /**
   * Creates the edit adhoc query form and sets the conditional controls of the adhoc query form.
   */
  ngOnInit() {
    this.createEditAdhocQueryForm();
    this.setConditionalControls();
  }

  /**
   * Creates the edit adhoc query form.
   */
  createEditAdhocQueryForm() {
    this.reportRunFrequencyData = this.adhocQueryTemplateData.reportRunFrequencies;
    this.editAdhocQueryForm = this.formBuilder.group({
      'name': [this.adhocQueryTemplateData.name, Validators.required],
      'query': [this.adhocQueryTemplateData.query, Validators.required],
      'tableName': [this.adhocQueryTemplateData.tableName, Validators.required],
      'tableFields': [this.adhocQueryTemplateData.tableFields, Validators.required],
      'email': [this.adhocQueryTemplateData.email, Validators.email],
      'reportRunFrequency': [''],
      'isActive': [this.adhocQueryTemplateData.isActive]
    });
  }

  /**
   * Sets the conditional controls of the adhoc query form
   */
  setConditionalControls() {
    this.editAdhocQueryForm.get('reportRunFrequency').valueChanges.subscribe(reportRunFrequencyId => {
      if (reportRunFrequencyId === 5) {
        this.editAdhocQueryForm.addControl('reportRunEvery', new FormControl('', [Validators.required, Validators.min(1)]));
        this.editAdhocQueryForm.get('reportRunEvery').patchValue(this.adhocQueryTemplateData.reportRunEvery);
      } else {
        this.editAdhocQueryForm.removeControl('reportRunEvery');
      }
    });
    this.editAdhocQueryForm.get('reportRunFrequency').patchValue(this.adhocQueryTemplateData.reportRunFrequency);
  }

  /**
   * Submits the adhoc query form and updates adhoc query,
   * if successful redirects to view adhoc query.
   */
  submit() {
    this.organizationService.updateAdhocQuery(this.adhocQueryTemplateData.id, this.editAdhocQueryForm.value).subscribe(() => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
