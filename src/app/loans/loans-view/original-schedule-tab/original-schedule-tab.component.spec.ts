import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OriginalScheduleTabComponent } from './original-schedule-tab.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('OriginalScheduleTabComponent', () => {
  let component: OriginalScheduleTabComponent;
  let fixture: ComponentFixture<OriginalScheduleTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OriginalScheduleTabComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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
