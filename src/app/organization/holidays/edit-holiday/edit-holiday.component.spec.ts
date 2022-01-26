import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditHolidayComponent } from './edit-holiday.component';

describe('EditHolidayComponent', () => {
  let component: EditHolidayComponent;
  let fixture: ComponentFixture<EditHolidayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditHolidayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
