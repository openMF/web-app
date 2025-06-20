import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-deposit-product-incentive-form-dialog',
  templateUrl: './deposit-product-incentive-form-dialog.component.html',
  styleUrls: ['./deposit-product-incentive-form-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class DepositProductIncentiveFormDialogComponent implements OnInit {
  layout: {
    addButtonText?: string;
  } = {
    addButtonText: 'Add'
  };

  depositProductIncentiveForm: UntypedFormGroup;

  title: string;

  entityTypeData: any;
  attributeNameData: any;
  conditionTypeData: any;
  attributeValueData: any;
  incentiveTypeData: any;

  constructor(
    public dialogRef: MatDialogRef<DepositProductIncentiveFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: UntypedFormBuilder,
    private translateService: TranslateService
  ) {
    this.createDepositProductIncentiveForm();
    this.setConditionalControls();
    this.layout = { ...this.layout, ...data.layout };
    this.dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.dialogRef.updateSize('400px');

    this.entityTypeData = this.data.chartTemplate.entityTypeOptions;
    this.attributeNameData = this.data.chartTemplate.attributeNameOptions;
    this.conditionTypeData = this.data.chartTemplate.conditionTypeOptions;
    this.incentiveTypeData = this.data.chartTemplate.incentiveTypeOptions;

    if (this.data.values) {
      this.depositProductIncentiveForm.patchValue({
        entityType: this.data.values.entityType,
        attributeName: this.data.values.attributeName,
        conditionType: this.data.values.conditionType,
        attributeValue: this.data.values.attributeValue,
        incentiveType: this.data.values.incentiveType,
        amount: this.data.values.amount
      });
    } else {
      this.depositProductIncentiveForm.patchValue({
        entityType: this.data.entityType
      });
    }
    this.title = this.translateService.instant('labels.heading.Incentives');
  }

  setConditionalControls() {
    this.depositProductIncentiveForm.get('attributeName').valueChanges.subscribe((attributeName: any) => {
      this.depositProductIncentiveForm.patchValue({ attributeValue: '' });
      this.attributeValueData =
        this.data.chartTemplate[
          `${this.attributeNameData.find((option: any) => option.id === attributeName).code.split('.')[1]}Options`
        ];
    });
  }

  createDepositProductIncentiveForm() {
    this.depositProductIncentiveForm = this.formBuilder.group({
      entityType: [''],
      attributeName: [
        '',
        Validators.required
      ],
      conditionType: [
        '',
        Validators.required
      ],
      attributeValue: [
        '',
        Validators.required
      ],
      incentiveType: [
        '',
        Validators.required
      ],
      amount: [
        '',
        Validators.required
      ]
    });
  }
}
