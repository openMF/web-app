import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignLoanOfficerComponent } from './assign-loan-officer.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('AssignLoanOfficerComponent', () => {
  let component: AssignLoanOfficerComponent;
  let fixture: ComponentFixture<AssignLoanOfficerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssignLoanOfficerComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignLoanOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
