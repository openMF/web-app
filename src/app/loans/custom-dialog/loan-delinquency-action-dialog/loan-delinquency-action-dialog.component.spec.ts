import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDelinquencyActionDialogComponent } from './loan-delinquency-action-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('LoanDelinquencyActionDialogComponent', () => {
  let component: LoanDelinquencyActionDialogComponent;
  let fixture: ComponentFixture<LoanDelinquencyActionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanDelinquencyActionDialogComponent],
      imports: [MatDialogModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanDelinquencyActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
