import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAttendanceComponent } from './group-attendance.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('GroupAttendanceComponent', () => {
  let component: GroupAttendanceComponent;
  let fixture: ComponentFixture<GroupAttendanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupAttendanceComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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
