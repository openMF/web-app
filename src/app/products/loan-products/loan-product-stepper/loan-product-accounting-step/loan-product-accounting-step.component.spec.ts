import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductAccountingStepComponent } from './loan-product-accounting-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('LoanProductAccountingStepComponent', () => {
  let component: LoanProductAccountingStepComponent;
  let fixture: ComponentFixture<LoanProductAccountingStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoanProductAccountingStepComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductAccountingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
