import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SharesAccountTermsStepComponent } from './shares-account-terms-step.component';

describe('SharesAccountTermsStepComponent', () => {
  let component: SharesAccountTermsStepComponent;
  let fixture: ComponentFixture<SharesAccountTermsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SharesAccountTermsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharesAccountTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
