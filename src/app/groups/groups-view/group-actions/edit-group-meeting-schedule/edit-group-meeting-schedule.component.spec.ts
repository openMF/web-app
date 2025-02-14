import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGroupMeetingScheduleComponent } from './edit-group-meeting-schedule.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('EditGroupMeetingScheduleComponent', () => {
  let component: EditGroupMeetingScheduleComponent;
  let fixture: ComponentFixture<EditGroupMeetingScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditGroupMeetingScheduleComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupMeetingScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
