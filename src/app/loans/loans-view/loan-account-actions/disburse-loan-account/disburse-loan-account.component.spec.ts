import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DisburseLoanAccountComponent } from './disburse-loan-account.component';

describe('DisburseLoanAccountComponent', () => {
  let component: DisburseLoanAccountComponent;
  let fixture: ComponentFixture<DisburseLoanAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DisburseLoanAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisburseLoanAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
