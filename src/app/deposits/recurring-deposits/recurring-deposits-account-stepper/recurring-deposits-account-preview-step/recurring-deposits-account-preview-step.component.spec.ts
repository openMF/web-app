import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountPreviewStepComponent } from './recurring-deposits-account-preview-step.component';

describe('RecurringDepositsAccountPreviewStepComponent', () => {
  let component: RecurringDepositsAccountPreviewStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositsAccountPreviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
