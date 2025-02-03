import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGroupMeetingComponent } from './edit-group-meeting.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('EditGroupMeetingComponent', () => {
  let component: EditGroupMeetingComponent;
  let fixture: ComponentFixture<EditGroupMeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditGroupMeetingComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
