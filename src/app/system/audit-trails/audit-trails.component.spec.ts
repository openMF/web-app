import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditTrailsComponent } from './audit-trails.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuditTrailsComponent', () => {
  let component: AuditTrailsComponent;
  let fixture: ComponentFixture<AuditTrailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuditTrailsComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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
