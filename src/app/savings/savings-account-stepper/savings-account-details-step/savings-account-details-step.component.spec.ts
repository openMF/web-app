import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavingsAccountDetailsStepComponent } from './savings-account-details-step.component';

describe('SavingsAccountDetailsStepComponent', () => {
  let component: SavingsAccountDetailsStepComponent;
  let fixture: ComponentFixture<SavingsAccountDetailsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsAccountDetailsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
