import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageHooksComponent } from './manage-hooks.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ManageHooksComponent', () => {
  let component: ManageHooksComponent;
  let fixture: ComponentFixture<ManageHooksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageHooksComponent],
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
    fixture = TestBed.createComponent(ManageHooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
