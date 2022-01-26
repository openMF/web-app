import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddLoanChargeComponent } from './add-loan-charge.component';

describe('AddloanchargeComponent', () => {
  let component: AddLoanChargeComponent;
  let fixture: ComponentFixture<AddLoanChargeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddLoanChargeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLoanChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
