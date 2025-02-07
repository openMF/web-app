import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositProductCurrencyStepComponent } from './fixed-deposit-product-currency-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

describe('FixedDepositProductCurrencyStepComponent', () => {
  let component: FixedDepositProductCurrencyStepComponent;
  let fixture: ComponentFixture<FixedDepositProductCurrencyStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositProductCurrencyStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        TranslateService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductCurrencyStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
