import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustLoanChargeComponent } from './adjust-loan-charge.component';

describe('AdjustLoanChargeComponent', () => {
  let component: AdjustLoanChargeComponent;
  let fixture: ComponentFixture<AdjustLoanChargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjustLoanChargeComponent ]
    })
    .compileComponents();
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
