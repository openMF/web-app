import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SharesAccountDetailsStepComponent } from './shares-account-details-step.component';

describe('SharesAccountDetailsStepComponent', () => {
  let component: SharesAccountDetailsStepComponent;
  let fixture: ComponentFixture<SharesAccountDetailsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SharesAccountDetailsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharesAccountDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
