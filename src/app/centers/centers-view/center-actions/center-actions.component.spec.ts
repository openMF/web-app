import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterActionsComponent } from './center-actions.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('CenterActionsComponent', () => {
  let component: CenterActionsComponent;
  let fixture: ComponentFixture<CenterActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CenterActionsComponent],
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
    fixture = TestBed.createComponent(CenterActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
