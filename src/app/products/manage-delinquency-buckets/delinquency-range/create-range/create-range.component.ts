import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-create-range',
  templateUrl: './create-range.component.html',
  styleUrls: ['./create-range.component.scss']
})
export class CreateRangeComponent implements OnInit {

  /** Delinquency Range form. */
  delinquencyRangeForm: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder,
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService) {
  }

  ngOnInit(): void {
    this.setInputForm();
  }

  /**
   * Create Input form.
   */
  setInputForm(): void {
    this.delinquencyRangeForm = this.formBuilder.group({
      'classification': ['', [Validators.required]],
      'minimumAgeDays': [0, [Validators.required, Validators.pattern('^(0*[1-9][0-9]*?)$'), Validators.max(1000)]],
      'maximumAgeDays': ['', [Validators.pattern('^(0*[1-9][0-9]*?)$'), Validators.max(10000)]],
    });
  }

  submit(): void {
    const delinquencyRangeFormData = this.delinquencyRangeForm.value;
    const locale = this.settingsService.language.code;
    const data = {
      ...delinquencyRangeFormData,
      locale
    };
    this.productsService.createDelinquencyRange(data).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
