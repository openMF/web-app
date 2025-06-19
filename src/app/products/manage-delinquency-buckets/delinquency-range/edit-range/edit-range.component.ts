import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-edit-range',
  templateUrl: './edit-range.component.html',
  styleUrls: ['./edit-range.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class EditRangeComponent implements OnInit {
  /** Delinquency Range Data. */
  delinquencyRangeData: any;
  /** Delinquency Range form. */
  delinquencyRangeForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { delinquencyRange: any }) => {
      this.delinquencyRangeData = data.delinquencyRange;
    });
  }

  ngOnInit(): void {
    this.setInputForm();
  }

  /**
   * Create Input form.
   */
  setInputForm(): void {
    this.delinquencyRangeForm = this.formBuilder.group({
      classification: [
        this.delinquencyRangeData.classification,
        [Validators.required]
      ],
      minimumAgeDays: [
        this.delinquencyRangeData.minimumAgeDays,
        [
          Validators.required,
          Validators.pattern('^(0*[1-9][0-9]*?)$'),
          Validators.max(1000)]
      ],
      maximumAgeDays: [
        this.delinquencyRangeData.maximumAgeDays,
        [
          Validators.pattern('^(0*[1-9][0-9]*?)$'),
          Validators.max(10000)]
      ]
    });
  }

  submit(): void {
    const delinquencyRangeFormData = this.delinquencyRangeForm.value;
    const locale = this.settingsService.language.code;
    const data = {
      ...delinquencyRangeFormData,
      locale
    };
    this.productsService.updateDelinquencyRange(this.delinquencyRangeData.id, data).subscribe((response: any) => {
      this.router.navigate(
        [
          '../../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}
