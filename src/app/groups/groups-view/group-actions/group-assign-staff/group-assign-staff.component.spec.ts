import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupAssignStaffComponent } from './group-assign-staff.component';

describe('GroupAssignStaffComponent', () => {
  let component: GroupAssignStaffComponent;
  let fixture: ComponentFixture<GroupAssignStaffComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAssignStaffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAssignStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
