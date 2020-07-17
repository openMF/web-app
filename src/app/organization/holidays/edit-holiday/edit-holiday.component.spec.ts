import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHolidayComponent } from './edit-holiday.component';

describe('EditHolidayComponent', () => {
  let component: EditHolidayComponent;
  let fixture: ComponentFixture<EditHolidayComponent>;

  beforeEach(async(() => {
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
