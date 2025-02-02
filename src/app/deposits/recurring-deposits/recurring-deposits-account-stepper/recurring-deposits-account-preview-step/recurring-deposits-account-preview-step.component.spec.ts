import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountPreviewStepComponent } from './recurring-deposits-account-preview-step.component';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';

describe('RecurringDepositsAccountPreviewStepComponent', () => {
  let component: RecurringDepositsAccountPreviewStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositsAccountPreviewStepComponent],
      imports: [TranslateModule],
      providers: [
        TranslateService,
        TranslateStore,
        TranslateLoader
      ]
    }).compileComponents();
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
