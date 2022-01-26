import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewHolidaysComponent } from './view-holidays.component';

describe('ViewHolidaysComponent', () => {
  let component: ViewHolidaysComponent;
  let fixture: ComponentFixture<ViewHolidaysComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewHolidaysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
