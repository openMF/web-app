import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositAccountChargesStepComponent } from './fixed-deposit-account-charges-step.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('FixedDepositAccountChargesStepComponent', () => {
  let component: FixedDepositAccountChargesStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountChargesStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositAccountChargesStepComponent],
      imports: [MatDialogModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
