import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkingDaysComponent } from './working-days.component';

describe('WorkingDaysComponent', () => {
  let component: WorkingDaysComponent;
  let fixture: ComponentFixture<WorkingDaysComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkingDaysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
