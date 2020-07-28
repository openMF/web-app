import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletionDialogComponent } from './completion-dialog.component';

describe('CompletionDialogComponent', () => {
  let component: CompletionDialogComponent;
  let fixture: ComponentFixture<CompletionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompletionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
