import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAuditComponent } from './view-audit.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewAuditComponent', () => {
  let component: ViewAuditComponent;
  let fixture: ComponentFixture<ViewAuditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewAuditComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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
