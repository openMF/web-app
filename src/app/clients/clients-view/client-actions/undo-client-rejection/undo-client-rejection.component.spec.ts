import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UndoClientRejectionComponent } from './undo-client-rejection.component';

describe('UndoClientRejectionComponent', () => {
  let component: UndoClientRejectionComponent;
  let fixture: ComponentFixture<UndoClientRejectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UndoClientRejectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoClientRejectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
