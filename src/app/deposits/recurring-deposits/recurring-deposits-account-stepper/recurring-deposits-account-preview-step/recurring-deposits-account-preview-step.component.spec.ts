import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { RecurringDepositsAccountPreviewStepComponent } from './recurring-deposits-account-preview-step.component';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore
} from '@ngx-translate/core';

describe('RecurringDepositsAccountPreviewStepComponent', () => {
  let component: RecurringDepositsAccountPreviewStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositsAccountPreviewStepComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
