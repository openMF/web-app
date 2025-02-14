import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountSettingsStepComponent } from './recurring-deposits-account-settings-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RecurringDepositsAccountSettingsStepComponent', () => {
  let component: RecurringDepositsAccountSettingsStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountSettingsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositsAccountSettingsStepComponent],
      imports: [
        ReactiveFormsModule,
        CommonModule,
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [DatePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountSettingsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
