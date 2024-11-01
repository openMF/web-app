import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingComponent } from './reporting.component';

describe('ReportingComponent', () => {
  let component: ReportingComponent;
  let fixture: ComponentFixture<ReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // @ts-ignore
    expect(component).toBeTruthy();
  });
});
