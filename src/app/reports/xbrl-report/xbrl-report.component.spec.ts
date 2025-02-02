import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XBRLReportComponent } from './xbrl-report.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

describe('XBRLReportComponent', () => {
  let component: XBRLReportComponent;
  let fixture: ComponentFixture<XBRLReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [XBRLReportComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        TranslateModule
      ],
      providers: [DatePipe]
    }).compileComponents();
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
