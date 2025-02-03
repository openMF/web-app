import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductTermsStepComponent } from './loan-product-terms-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('LoanProductTermsStepComponent', () => {
  let component: LoanProductTermsStepComponent;
  let fixture: ComponentFixture<LoanProductTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoanProductTermsStepComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {}
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
