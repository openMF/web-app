import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyboardShortcutsComponent } from './keyboard-shortcuts.component';

describe('HelpComponent', () => {
  let component: KeyboardShortcutsComponent;
  let fixture: ComponentFixture<KeyboardShortcutsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KeyboardShortcutsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardShortcutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
