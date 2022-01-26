import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AttachCenterMeetingComponent } from './attach-center-meeting.component';

describe('AttachCenterMeetingComponent', () => {
  let component: AttachCenterMeetingComponent;
  let fixture: ComponentFixture<AttachCenterMeetingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachCenterMeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachCenterMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
