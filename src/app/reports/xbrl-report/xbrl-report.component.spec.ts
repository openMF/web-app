import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XBRLReportComponent } from './xbrl-report.component';

describe('XBRLReportComponent', () => {
  let component: XBRLReportComponent;
  let fixture: ComponentFixture<XBRLReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XBRLReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XBRLReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
