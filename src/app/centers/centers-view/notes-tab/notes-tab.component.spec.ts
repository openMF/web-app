import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesTabComponent } from './notes-tab.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('NotesTabComponent', () => {
  let component: NotesTabComponent;
  let fixture: ComponentFixture<NotesTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotesTabComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
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
