import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientActionsComponent } from './client-actions.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ClientActionsComponent', () => {
  let component: ClientActionsComponent;
  let fixture: ComponentFixture<ClientActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClientActionsComponent],
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
    fixture = TestBed.createComponent(ClientActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
