import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHolidayComponent } from './create-holiday.component';

describe('CreateHolidayComponent', () => {
  let component: CreateHolidayComponent;
  let fixture: ComponentFixture<CreateHolidayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateHolidayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
