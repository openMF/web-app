import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { KeyboardShortcutsDialogComponent } from './keyboard-shortcuts-dialog.component';

describe('KeyboardShortcutsDialogComponent', () => {
  let component: KeyboardShortcutsDialogComponent;
  let fixture: ComponentFixture<KeyboardShortcutsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyboardShortcutsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardShortcutsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
