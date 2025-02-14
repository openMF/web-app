import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductSettingsStepComponent } from './loan-product-settings-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('LoanProductSettingsStepComponent', () => {
  let component: LoanProductSettingsStepComponent;
  let fixture: ComponentFixture<LoanProductSettingsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoanProductSettingsStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [TranslateService],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductSettingsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
