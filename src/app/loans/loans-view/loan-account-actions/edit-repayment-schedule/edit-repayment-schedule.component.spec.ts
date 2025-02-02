import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRepaymentScheduleComponent } from './edit-repayment-schedule.component';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('EditRepaymentScheduleComponent', () => {
  let component: EditRepaymentScheduleComponent;
  let fixture: ComponentFixture<EditRepaymentScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditRepaymentScheduleComponent],
      imports: [HttpClientModule],
      providers: [DatePipe]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRepaymentScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
