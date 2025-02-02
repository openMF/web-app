import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustLoanChargeComponent } from './adjust-loan-charge.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('AdjustLoanChargeComponent', () => {
  let component: AdjustLoanChargeComponent;
  let fixture: ComponentFixture<AdjustLoanChargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdjustLoanChargeComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustLoanChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
