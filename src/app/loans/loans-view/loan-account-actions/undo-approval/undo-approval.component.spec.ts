import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoApprovalComponent } from './undo-approval.component';

describe('UndoApprovalComponent', () => {
  let component: UndoApprovalComponent;
  let fixture: ComponentFixture<UndoApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UndoApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
