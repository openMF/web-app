import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDelinquencyActionDialogComponent } from './loan-delinquency-action-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('LoanDelinquencyActionDialogComponent', () => {
  let component: LoanDelinquencyActionDialogComponent;
  let fixture: ComponentFixture<LoanDelinquencyActionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanDelinquencyActionDialogComponent],
      imports: [MatDialogModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanDelinquencyActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
