import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportParameterDialogComponent } from './report-parameter-dialog.component';

describe('AddReportParameterDialogComponent', () => {
  let component: ReportParameterDialogComponent;
  let fixture: ComponentFixture<ReportParameterDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportParameterDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportParameterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
