import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupAttendanceComponent } from './group-attendance.component';

describe('GroupAttendanceComponent', () => {
  let component: GroupAttendanceComponent;
  let fixture: ComponentFixture<GroupAttendanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAttendanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
