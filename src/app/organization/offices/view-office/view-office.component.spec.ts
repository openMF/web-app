import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewOfficeComponent } from './view-office.component';

describe('ViewOfficeComponent', () => {
  let component: ViewOfficeComponent;
  let fixture: ComponentFixture<ViewOfficeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewOfficeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
