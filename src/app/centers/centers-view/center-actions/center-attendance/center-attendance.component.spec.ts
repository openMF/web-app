import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CenterAttendanceComponent } from './center-attendance.component';

describe('CenterAttendanceComponent', () => {
  let component: CenterAttendanceComponent;
  let fixture: ComponentFixture<CenterAttendanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CenterAttendanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
