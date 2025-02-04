import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositProductSettingsStepComponent } from './fixed-deposit-product-settings-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('FixedDepositProductSettingsStepComponent', () => {
  let component: FixedDepositProductSettingsStepComponent;
  let fixture: ComponentFixture<FixedDepositProductSettingsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositProductSettingsStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductSettingsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
