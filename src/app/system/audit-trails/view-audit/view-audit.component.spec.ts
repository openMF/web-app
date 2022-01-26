import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewAuditComponent } from './view-audit.component';

describe('ViewAuditComponent', () => {
  let component: ViewAuditComponent;
  let fixture: ComponentFixture<ViewAuditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAuditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
