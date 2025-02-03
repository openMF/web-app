import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountTermsStepComponent } from './savings-account-terms-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('SavingsAccountTermsStepComponent', () => {
  let component: SavingsAccountTermsStepComponent;
  let fixture: ComponentFixture<SavingsAccountTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingsAccountTermsStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule
      ],
      providers: [
        DatePipe,
        TranslateModule
      ]
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
