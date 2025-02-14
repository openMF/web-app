import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositProductAccountingStepComponent } from './recurring-deposit-product-accounting-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RecurringDepositProductAccountingStepComponent', () => {
  let component: RecurringDepositProductAccountingStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductAccountingStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositProductAccountingStepComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [TranslateService],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositProductAccountingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
