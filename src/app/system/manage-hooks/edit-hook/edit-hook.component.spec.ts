import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHookComponent } from './edit-hook.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('EditHookComponent', () => {
  let component: EditHookComponent;
  let fixture: ComponentFixture<EditHookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditHookComponent],
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
    fixture = TestBed.createComponent(EditHookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
