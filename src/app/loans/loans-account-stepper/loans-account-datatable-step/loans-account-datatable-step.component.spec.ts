import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountDatatableStepComponent } from './loans-account-datatable-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

describe('LoansAccountDatatableStepComponent', () => {
  let component: LoansAccountDatatableStepComponent;
  let fixture: ComponentFixture<LoansAccountDatatableStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoansAccountDatatableStepComponent],
      imports: [ReactiveFormsModule],
      providers: [DatePipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountDatatableStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
