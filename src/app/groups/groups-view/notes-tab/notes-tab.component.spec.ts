import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NotesTabComponent } from './notes-tab.component';

describe('NotesTabComponent', () => {
  let component: NotesTabComponent;
  let fixture: ComponentFixture<NotesTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NotesTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
