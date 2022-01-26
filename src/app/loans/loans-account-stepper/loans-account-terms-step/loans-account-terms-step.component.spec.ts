import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoansAccountTermsStepComponent } from './loans-account-terms-step.component';

describe('LoansAccountTermsStepComponent', () => {
  let component: LoansAccountTermsStepComponent;
  let fixture: ComponentFixture<LoansAccountTermsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoansAccountTermsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
