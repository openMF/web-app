import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountAssignStaffComponent } from './savings-account-assign-staff.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('SavingsAccountAssignStaffComponent', () => {
  let component: SavingsAccountAssignStaffComponent;
  let fixture: ComponentFixture<SavingsAccountAssignStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingsAccountAssignStaffComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountAssignStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
