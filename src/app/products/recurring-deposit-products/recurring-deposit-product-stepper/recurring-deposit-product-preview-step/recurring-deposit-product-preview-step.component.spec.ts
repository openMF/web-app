import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositProductPreviewStepComponent } from './recurring-deposit-product-preview-step.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('RecurringDepositProductPreviewStepComponent', () => {
  let component: RecurringDepositProductPreviewStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositProductPreviewStepComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
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
