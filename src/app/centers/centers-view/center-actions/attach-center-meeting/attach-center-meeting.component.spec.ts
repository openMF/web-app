import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachCenterMeetingComponent } from './attach-center-meeting.component';

describe('AttachCenterMeetingComponent', () => {
  let component: AttachCenterMeetingComponent;
  let fixture: ComponentFixture<AttachCenterMeetingComponent>;

  beforeEach(async(() => {
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
