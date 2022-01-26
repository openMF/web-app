import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AuditTrailsComponent } from './audit-trails.component';

describe('AuditTrailsComponent', () => {
  let component: AuditTrailsComponent;
  let fixture: ComponentFixture<AuditTrailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditTrailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditTrailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
