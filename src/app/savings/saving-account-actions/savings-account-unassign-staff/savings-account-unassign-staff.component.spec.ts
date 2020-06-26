import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountUnassignStaffComponent } from './savings-account-unassign-staff.component';

describe('SavingsAccountUnassignStaffComponent', () => {
  let component: SavingsAccountUnassignStaffComponent;
  let fixture: ComponentFixture<SavingsAccountUnassignStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsAccountUnassignStaffComponent ]
    })
    .compileComponents();
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
