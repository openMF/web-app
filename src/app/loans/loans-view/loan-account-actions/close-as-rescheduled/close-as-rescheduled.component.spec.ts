import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseAsRescheduledComponent } from './close-as-rescheduled.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('CloseAsRescheduledComponent', () => {
  let component: CloseAsRescheduledComponent;
  let fixture: ComponentFixture<CloseAsRescheduledComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CloseAsRescheduledComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseAsRescheduledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
