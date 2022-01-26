import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UndoClientTransferComponent } from './undo-client-transfer.component';

describe('UndoClientTransferComponent', () => {
  let component: UndoClientTransferComponent;
  let fixture: ComponentFixture<UndoClientTransferComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UndoClientTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoClientTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
