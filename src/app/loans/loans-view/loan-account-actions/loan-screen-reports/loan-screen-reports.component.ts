/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef,
  SecurityContext,
  inject
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { switchMap } from 'rxjs';
import { ProductsService } from 'app/products/products.service';
import { TemplatesService } from 'app/templates/templates.service';
import { PRINT_HEAD } from 'app/templates/template-merge';

/** Custom Services */
import { DomSanitizer } from '@angular/platform-browser';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';
import { environment } from '../../../../../environments/environment';

/**
 * The templates for a loan of this product. A template names the loan products it is for, by short name, in a tag
 * at the end of its name, `अनुसूची १(क) – ऋण माग पत्र [SL, FD]`; a template without a tag is for every loan. The tag is
 * not shown. With no short name (not loaded yet) nothing is hidden.
 * ponytail: the tag is in the name because Fineract templates have no product link; move it there if one is added.
 */
export function templatesForProduct(templates: any[], productShortName?: string): any[] {
  const product = productShortName?.trim().toUpperCase();
  return (templates ?? [])
    .map((template) => {
      const tag = /\s*\[([^\]]*)\]\s*$/.exec(template.name ?? '');
      return {
        ...template,
        name: tag ? template.name.slice(0, tag.index) : template.name,
        products: tag
          ? tag[1]
              .split(',')
              .map((code: string) => code.trim().toUpperCase())
              .filter(Boolean)
          : []
      };
    })
    .filter((template) => !product || template.products.length === 0 || template.products.includes(product));
}

/**
 * Loans Screen Reports Component.
 */
@Component({
  selector: 'mifosx-loan-screen-reports',
  templateUrl: './loan-screen-reports.component.html',
  styleUrls: ['./loan-screen-reports.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanScreenReportsComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private sanitizer = inject(DomSanitizer);
  private renderer = inject(Renderer2);
  private productsService = inject(ProductsService);
  private templatesService = inject(TemplatesService);
  private cdr = inject(ChangeDetectorRef);

  /** Production Mode Flag */
  productionMode = environment.productionMode === true;

  /** Loan Screen Reportform. */
  loanScreenReportForm!: UntypedFormGroup;
  /** Templates Data */
  templatesData: any;
  /** HTML Template */
  template: any;

  /** Screen report output reference */
  @ViewChild('screenReport', { static: true }) screenReportRef!: ElementRef;

  /**
   * Fetches Loan Action Data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {LoansService} loansService Loans Service
   * @param {ActivatedRoute} route Activated Route
   * @param {DomSanitizer} sanitizer DOM Sanitizer
   * @param {Renderer2} renderer Renderer 2
   */
  constructor() {
    super();
  }

  /**
   * Creates the loan screen report form.
   */
  ngOnInit() {
    this.templatesData = templatesForProduct(this.dataObject);
    this.createLoanScreenReportForm();
    this.loanService
      .getLoanAccountDetails(this.loanId)
      .pipe(switchMap((loan: any) => this.productsService.getLoanProduct('loanproducts', loan.loanProductId)))
      .subscribe((product: any) => {
        this.templatesData = templatesForProduct(this.dataObject, product.shortName);
        this.cdr.markForCheck();
      });
  }

  /**
   * Creates the loan screen report form.
   */
  createLoanScreenReportForm() {
    this.loanScreenReportForm = this.formBuilder.group({
      templateId: ['']
    });
  }

  /**
   * Prints loan screen report
   */
  print() {
    const templateWindow = window.open('', 'Screen Report', 'height=400,width=600');
    if (templateWindow) {
      templateWindow.document.write('<html><head>' + PRINT_HEAD);
      templateWindow.document.write('</head><body>');
      templateWindow.document.write(this.template);
      templateWindow.document.write('</body></html>');
      templateWindow.print();
      templateWindow.close();
    }
  }

  /**
   * Submits the form and generates screen report for the loan.
   */
  generate() {
    const templateId = this.loanScreenReportForm.get('templateId')?.value;
    if (templateId) {
      this.templatesService.fillTemplate(templateId, { loanId: this.loanId }).subscribe((response: any) => {
        this.template = this.sanitizer.sanitize(SecurityContext.HTML, response);
        this.renderer.setProperty(this.screenReportRef.nativeElement, 'innerHTML', this.template);
      });
    }
  }
}
