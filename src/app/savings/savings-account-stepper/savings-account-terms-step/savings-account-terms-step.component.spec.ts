import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountTermsStepComponent } from './savings-account-terms-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SavingsAccountTermsStepComponent', () => {
  let component: SavingsAccountTermsStepComponent;
  let fixture: ComponentFixture<SavingsAccountTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingsAccountTermsStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        DatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
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
