import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositProductChargesStepComponent } from './fixed-deposit-product-charges-step.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('FixedDepositProductChargesStepComponent', () => {
  let component: FixedDepositProductChargesStepComponent;
  let fixture: ComponentFixture<FixedDepositProductChargesStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositProductChargesStepComponent],
      imports: [
        MatDialogModule,
        TranslateModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
