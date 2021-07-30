/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Create Entity Data Table Checks component.
 */
@Component({
  selector: 'mifosx-scorecard-feature-actions',
  templateUrl: './scorecard-feature-actions.component.html',
  styleUrls: ['./scorecard-feature-actions.component.scss']
})
export class ScorecardFeatureActionsComponent implements OnInit {

  featureId: any;

  scorecardFeatureForm: FormGroup;

  scorecardFeatureData: any;

  valueTypeOptions: any[];

  dataTypeOptions: any[];

  categoryOptions: any[];

  /**
   * Retrieves Entity Datatable Checks data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {Router} router Router.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private organizationService: OrganizationService,
              private router: Router,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data) => {
      this.scorecardFeatureData = data.scorecard;
      this.valueTypeOptions = this.scorecardFeatureData.valueTypeOptions;
      this.dataTypeOptions = this.scorecardFeatureData.dataTypeOptions;
      this.categoryOptions = this.scorecardFeatureData.categoryOptions;
    });
    this.featureId = this.route.parent.snapshot.params['featureId'];
  }

  ngOnInit() {
    this.setCreateScorecardFeatureForm();
  }

  /**
   * Sets Entity Data Table Form.
   */
  setCreateScorecardFeatureForm() {
    this.scorecardFeatureForm = this.formBuilder.group({
      'name': [this.scorecardFeatureData?.name, Validators.required],
      'valueType': [this.scorecardFeatureData?.valueType?.id, Validators.required],
      'dataType': [this.scorecardFeatureData?.dataType?.id, Validators.required],
      'category': [this.scorecardFeatureData?.category?.id, Validators.required],
      'active': [this.scorecardFeatureData?.active, Validators.required]
    });
  }

  navigateBack() {
    this.router.navigate(['../../../'], { relativeTo: this.route });
  }

  /**
   * Submits Entity Datble Form.
   */
  submit() {

    const scorecardFeature = this.scorecardFeatureForm.value;
    scorecardFeature.locale = this.settingsService.language.code;

    if (this.featureId) {
      this.organizationService.updateCreditScorecardFeature(this.featureId, scorecardFeature).subscribe((response: any) => {
        this.navigateBack();
      });
    } else {
      this.organizationService.createCreditScorecardFeature(scorecardFeature).subscribe((response: any) => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
    }
  }

}
