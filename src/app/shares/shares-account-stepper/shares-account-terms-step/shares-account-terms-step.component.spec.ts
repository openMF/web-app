import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharesAccountTermsStepComponent } from './shares-account-terms-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

describe('SharesAccountTermsStepComponent', () => {
  let component: SharesAccountTermsStepComponent;
  let fixture: ComponentFixture<SharesAccountTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SharesAccountTermsStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule,
        CommonModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharesAccountTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
