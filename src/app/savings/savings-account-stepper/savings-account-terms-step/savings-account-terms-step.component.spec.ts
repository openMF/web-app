import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavingsAccountTermsStepComponent } from './savings-account-terms-step.component';

describe('SavingsAccountTermsStepComponent', () => {
  let component: SavingsAccountTermsStepComponent;
  let fixture: ComponentFixture<SavingsAccountTermsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsAccountTermsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
