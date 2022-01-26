import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RunReportComponent } from './run-report.component';

describe('RunReportComponent', () => {
  let component: RunReportComponent;
  let fixture: ComponentFixture<RunReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RunReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
