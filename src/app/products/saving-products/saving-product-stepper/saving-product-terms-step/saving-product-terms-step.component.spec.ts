import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductTermsStepComponent } from './saving-product-terms-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';

describe('SavingProductTermsStepComponent', () => {
  let component: SavingProductTermsStepComponent;
  let fixture: ComponentFixture<SavingProductTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingProductTermsStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        TranslateService,
        DatePipe
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
