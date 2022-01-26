import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CloseAsRescheduledComponent } from './close-as-rescheduled.component';

describe('CloseAsRescheduledComponent', () => {
  let component: CloseAsRescheduledComponent;
  let fixture: ComponentFixture<CloseAsRescheduledComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseAsRescheduledComponent ]
    })
    .compileComponents();
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
