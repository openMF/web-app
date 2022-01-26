import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewReportComponent } from './view-report.component';

describe('ViewReportComponent', () => {
  let component: ViewReportComponent;
  let fixture: ComponentFixture<ViewReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
