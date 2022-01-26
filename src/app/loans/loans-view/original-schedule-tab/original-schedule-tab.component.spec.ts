import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OriginalScheduleTabComponent } from './original-schedule-tab.component';

describe('OriginalScheduleTabComponent', () => {
  let component: OriginalScheduleTabComponent;
  let fixture: ComponentFixture<OriginalScheduleTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OriginalScheduleTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OriginalScheduleTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
