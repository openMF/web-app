import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharesAccountTermsStepComponent } from './shares-account-terms-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

describe('SharesAccountTermsStepComponent', () => {
  let component: SharesAccountTermsStepComponent;
  let fixture: ComponentFixture<SharesAccountTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SharesAccountTermsStepComponent],
      imports: [ReactiveFormsModule],
      providers: [DatePipe]
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
