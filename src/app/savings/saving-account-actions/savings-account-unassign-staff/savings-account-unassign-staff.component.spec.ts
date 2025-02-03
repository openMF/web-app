import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountUnassignStaffComponent } from './savings-account-unassign-staff.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('SavingsAccountUnassignStaffComponent', () => {
  let component: SavingsAccountUnassignStaffComponent;
  let fixture: ComponentFixture<SavingsAccountUnassignStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingsAccountUnassignStaffComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountUnassignStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
