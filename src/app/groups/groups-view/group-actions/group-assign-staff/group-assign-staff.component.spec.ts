import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAssignStaffComponent } from './group-assign-staff.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('GroupAssignStaffComponent', () => {
  let component: GroupAssignStaffComponent;
  let fixture: ComponentFixture<GroupAssignStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupAssignStaffComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
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
