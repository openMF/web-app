import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { FixedDepositProductAccountingStepComponent } from './fixed-deposit-product-accounting-step.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('FixedDepositProductAccountingStepComponent', () => {
  let component: FixedDepositProductAccountingStepComponent;
  let fixture: ComponentFixture<FixedDepositProductAccountingStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositProductAccountingStepComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductAccountingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
