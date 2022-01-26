import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecurringDepositProductPreviewStepComponent } from './recurring-deposit-product-preview-step.component';

describe('RecurringDepositProductPreviewStepComponent', () => {
  let component: RecurringDepositProductPreviewStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductPreviewStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositProductPreviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositProductPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
