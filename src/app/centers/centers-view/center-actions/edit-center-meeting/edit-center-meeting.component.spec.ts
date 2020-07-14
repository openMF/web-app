import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCenterMeetingComponent } from './edit-center-meeting.component';

describe('EditCenterMeetingComponent', () => {
  let component: EditCenterMeetingComponent;
  let fixture: ComponentFixture<EditCenterMeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCenterMeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCenterMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
