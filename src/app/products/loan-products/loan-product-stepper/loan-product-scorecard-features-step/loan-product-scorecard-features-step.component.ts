import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { forEach } from 'lodash';

@Component({
  selector: 'mifosx-loan-product-scorecard-features-step',
  templateUrl: './loan-product-scorecard-features-step.component.html',
  styleUrls: ['./loan-product-scorecard-features-step.component.scss']
})
export class LoanProductScorecardFeaturesStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;
  @Input() loanProductFormValid: boolean;

  dataSourceData: string[] = ['XML', 'JSON', 'SQL'];

  displayedColumns: string[] = ['feature', 'valueType', 'dataType', 'category', 'action'];

  loanProductScorecardFeaturesStepForm: FormGroup;

  featuresDataSource: {}[] = [];

  featureData: {}[] = [];

  featureOptions: {}[] = [];

  selectedFeature: any;

  pristine = true;

  constructor(public dialog: MatDialog, private formBuilder: FormBuilder) {
    this.createLoanProductScorecardFeaturesStepForm();
    this.buildDependencies();
  }

  ngOnInit() {
    const options = this.loanProductsTemplate.scorecardFeatureOptions as {}[];

    this.featuresDataSource = this.loanProductsTemplate.scorecardFeatures || [];

    this.featureOptions = this.filterDropdown(options);

    this.loanProductScorecardFeaturesStepForm.get('feature').valueChanges.subscribe(value => {
      if (value) {
        this.selectedFeature = value;
      }
    })
  }

  private createLoanProductScorecardFeaturesStepForm() {
    this.loanProductScorecardFeaturesStepForm = this.formBuilder.group({
      'feature': new FormControl('', [Validators.required]),

      'weightage': new FormControl(0.0, [Validators.required]),
      'greenMin': new FormControl(0, [Validators.required, Validators.min(0)]),
      'greenMax': new FormControl(3, [Validators.required]),
      'amberMin': new FormControl(4, [Validators.required]),
      'amberMax': new FormControl(6, [Validators.required]),
      'redMin': new FormControl(7, [Validators.required]),
      'redMax': new FormControl(10, [Validators.required]),

      'criteriaScores': new FormArray([this.newCriteriaScore()], [Validators.required]),
    })

  }

  private buildDependencies() {
    this.loanProductScorecardFeaturesStepForm.get('greenMin').valueChanges.subscribe(value => {
      this.loanProductScorecardFeaturesStepForm.setControl('greenMax', new FormControl('', [Validators.required, Validators.min(value)]));
    })
    this.loanProductScorecardFeaturesStepForm.get('greenMax').valueChanges.subscribe(value => {
      this.loanProductScorecardFeaturesStepForm.setControl('amberMin', new FormControl('', [Validators.required, Validators.min(value)]));
    })

    this.loanProductScorecardFeaturesStepForm.get('amberMin').valueChanges.subscribe(value => {
      this.loanProductScorecardFeaturesStepForm.setControl('amberMax', new FormControl('', [Validators.required, Validators.min(value)]));
    })
    this.loanProductScorecardFeaturesStepForm.get('amberMax').valueChanges.subscribe(value => {
      this.loanProductScorecardFeaturesStepForm.setControl('redMin', new FormControl('', [Validators.required, Validators.min(value)]));
    })

    this.loanProductScorecardFeaturesStepForm.get('redMin').valueChanges.subscribe(value => {
      this.loanProductScorecardFeaturesStepForm.setControl('redMax', new FormControl('', [Validators.required, Validators.min(value)]));
    })
  }

  private newCriteriaScore() {
    return this.formBuilder.group({
      criteria: new FormControl('', [Validators.required]),
      score: new FormControl('', [Validators.required])
    });
  }

  criteriaScore() {
    return this.loanProductScorecardFeaturesStepForm.get('criteriaScores') as FormArray;
  }

  addCriteriaScore() {
    this.criteriaScore().push(this.newCriteriaScore());
  }


  removeCriteriaScore(i: number) {
    this.criteriaScore().removeAt(i);
  }

  addFeature() {
    const featureFormValues = this.loanProductScorecardFeaturesStepForm.value;

    const scorecardFeature = { ...featureFormValues, ...featureFormValues.feature, criteria: featureFormValues.criteriaScores };

    this.featuresDataSource = this.featuresDataSource.concat([scorecardFeature]);

    // Remove option from features dropdown
    this.featureOptions = this.filterDropdown(this.featureOptions);

    this.loanProductScorecardFeaturesStepForm.get("feature").reset();

    this.criteriaScore().clear();
    this.addCriteriaScore();

    this.loanProductScorecardFeaturesStepForm.markAsDirty();
  }

  filterDropdown(options: any) {
    let filteredOptions = options;

    // Remove option from features dropdown
    for (let i=0; i < this.featuresDataSource.length; i++) {

      for (let j=0; j < options.length; j++) {

        if (this.featuresDataSource[i]['featureId'] === options[j]['featureId']) {
          filteredOptions.splice(filteredOptions.indexOf(options[j]), 1);
          filteredOptions = filteredOptions.concat([]);
          break;

        }

      }

    }

    return filteredOptions;
  }

  editFeature(feature: any) {
    this.featuresDataSource.splice(this.featuresDataSource.indexOf(feature), 1);
    this.featuresDataSource = this.featuresDataSource.concat([]);

    this.selectedFeature = feature;
    const options = this.loanProductsTemplate.scorecardFeatureOptions as {}[];
    for (let i = 0; i < options.length; i++) {
      if (options[i]["id"] === feature.id) {
        this.selectedFeature = options[i];
        break;
      }
    }

    this.featureOptions.push(this.selectedFeature);

    this.criteriaScore().clear();

    feature.criteria.forEach(() => {
      this.addCriteriaScore();
    });

    this.loanProductScorecardFeaturesStepForm.patchValue({
      'feature': this.selectedFeature,

      'weightage': feature.weightage,
      'greenMin': feature.greenMin,
      'greenMax': feature.greenMax,
      'amberMin': feature.amberMin,
      'amberMax': feature.amberMax,
      'redMin': feature.redMin,
      'redMax': feature.redMax,

      'criteriaScores': feature.criteria,

    })
    //
  }

  deleteFeature(feature: any) {
    const deleteFeatureDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `feature ${feature.name}` }
    });
    deleteFeatureDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.featuresDataSource.splice(this.featuresDataSource.indexOf(feature), 1);
        this.featuresDataSource = this.featuresDataSource.concat([]);
        this.featureOptions = this.featureOptions.concat([feature]);
        this.pristine = false;
      }
    });
  }

  get loanProductScorecardFeatures() {

    if (this.featuresDataSource.length > 0) {
      this.featureData = this.featuresDataSource.map((feature: any) => ({
        id: feature.id,
        featureId: feature.featureId,
        weightage: feature.weightage,

        greenMin: feature.greenMin,
        greenMax: feature.greenMax,
        amberMin: feature.amberMin,
        amberMax: feature.amberMax,
        redMin: feature.redMin,
        redMax: feature.redMax,

        criteriaScores: feature.criteria
      }));
    }

    return {
      scorecardFeatures: this.featureData
    };
  }

}
