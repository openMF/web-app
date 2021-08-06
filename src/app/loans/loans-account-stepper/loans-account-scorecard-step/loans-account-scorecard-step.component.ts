/** Angular Imports */
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

/** Dialog Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { LoansAccountAddCollateralDialogComponent } from 'app/loans/custom-dialog/loans-account-add-collateral-dialog/loans-account-add-collateral-dialog.component';

/** Custom Services */
import { DatePipe } from '@angular/common';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Recurring Deposit Account Charges Step
 */
@Component({
  selector: 'mifosx-loans-account-scorecard-step',
  templateUrl: './loans-account-scorecard-step.component.html',
  styleUrls: ['./loans-account-scorecard-step.component.scss']
})
export class LoansAccountScorecardStepComponent implements OnInit, OnChanges {

  // @Input loansAccountProductTemplate: LoansAccountProductTemplate
  @Input() loansAccountProductTemplate: any;
  // @Imput loansAccountTemplate: LoansAccountTemplate
  @Input() loansAccountTemplate: any;
  // @Input() loansAccountFormValid: LoansAccountFormValid
  @Input() loansAccountFormValid: boolean;

  loanAccountScorecardForm: FormGroup;

  scorecard: any;

  scoringMethod: string;

  scoringMethods: {}[];

  mlScoringModels: {}[];

  statScoringModels: {}[];

  ruleBasedScoringModels: {}[];

  featureOptions: any;

  /**
   * Loans Account Scorecard features Form Step
   * @param {dialog} MatDialog Mat Dialog
   * @param {datePipe} DatePipe DatePipe
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private settingsService: SettingsService) {
      this.createLoanAccountScorecardForm();
  }


  ngOnInit() {

  }

  /**
   * Executes on change of input values
   */
   ngOnChanges() {
    this.featureOptions = this.loansAccountProductTemplate?.scorecardFeatureOptions as [];

    this.scoringMethods = this.loansAccountProductTemplate?.scorecard?.scoringMethods;

    this.mlScoringModels = this.loansAccountProductTemplate?.scorecard?.mlScorecard?.scoringModels;
    this.statScoringModels = this.loansAccountProductTemplate?.scorecard?.statScorecard?.scoringModels;
    this.ruleBasedScoringModels = this.loansAccountProductTemplate?.scorecard?.ruleBasedScorecard?.scoringModels;

    this.scorecard = this.loansAccountTemplate?.scorecard;

    this.loanAccountScorecardForm.get('scoringMethod').valueChanges.subscribe(selectedValue => {
      console.log(selectedValue);
      this.scoringMethod = selectedValue;


      this.loanAccountScorecardForm.removeControl('mlScorecard');
      this.loanAccountScorecardForm.removeControl('statScorecard');
      this.loanAccountScorecardForm.removeControl('ruleBasedScorecard');

      if (selectedValue === "ml") {
        this.loanAccountScorecardForm.addControl('mlScorecard', this.mlAndStatScorecardForm());
        this.loanAccountScorecardForm.patchValue({
          'scoringModel': "RandomForestClassifier"
        });
      }

      if (selectedValue === "stat") {
        this.loanAccountScorecardForm.addControl('statScorecard', this.mlAndStatScorecardForm());
        this.loanAccountScorecardForm.patchValue({
          'scoringModel': "linearRegression"
        });
      }

      if (selectedValue === "ruleBased") {
        this.loanAccountScorecardForm.addControl('ruleBasedScorecard', this.ruleBasedScorecardForm())
        this.loanAccountScorecardForm.patchValue({
          'scoringModel': "ruleBased"
        });
      }

    })

    console.log(this);
  }

  printJSON(ft: any) {
    console.log(ft);
  }


  private createLoanAccountScorecardForm() {
    this.loanAccountScorecardForm = this.formBuilder.group({
      'scoringMethod': [null, Validators.required],
      'scoringModel': [null, Validators.required]
    })
  }

  private mlAndStatScorecardForm() {
    return new FormGroup({
      'age': new FormControl(null, [Validators.required]),
      'sex': new FormControl(null, [Validators.required]),
      'job': new FormControl(null, [Validators.required]),
      'housing': new FormControl(null, [Validators.required]),
      'creditAmount': new FormControl(null, [Validators.required]),
      'duration': new FormControl(null, [Validators.required]),
      'purpose': new FormControl(null, [Validators.required])
    }, [Validators.required]);
  }

  private ruleBasedScorecardForm() {
    const featureForms: AbstractControl[] = []

    this.featureOptions?.forEach((feature: any) => {
      featureForms.push(this.newCriteriaScoreForm(feature));
    });

    return new FormGroup({
      'criteriaScores': new FormArray(featureForms, [Validators.required]),
    }, [Validators.required])
  }

  private newCriteriaScoreForm(feature: any) {
    return this.formBuilder.group({
      'featureId': new FormControl(feature.id, [Validators.required]),
      'value': new FormControl(null, [Validators.required])
    });
  }

  criteriaScores() {
    return this.loanAccountScorecardForm.get('ruleBasedScorecard').get('criteriaScores') as FormArray;
  }

  featureFromId(featureId: any) {
    for (let i=0; i < this.featureOptions.length; i++) {
      if (this.featureOptions[i]['id'] === featureId) {
        return this.featureOptions[i];
      }
    }
  }

  public formIsNotPristineAndValid() {

    if (this.scoringMethod) {
      return !this.loanAccountScorecardForm.pristine && this.loanAccountScorecardForm.valid;
    } else {
      return true;
    }

  }

  /**
   * Returns Loans Account Scorecard Features Form
   */
  get loansAccountScorecard() {
    const data = this.loanAccountScorecardForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;

    if (data.mlScorecard) {
      data.mlScorecard.locale = locale;
      data.mlScorecard.dateFormat = dateFormat;
    }

    if (data.statScorecard) {
      data.statScorecard.locale = locale;
      data.statScorecard.dateFormat = dateFormat;
    }

    console.log(data);

    return {
      scorecard: { ...data, locale, dateFormat}
    }
  }
}
