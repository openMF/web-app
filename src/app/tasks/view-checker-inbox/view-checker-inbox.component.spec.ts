import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCheckerInboxComponent } from './view-checker-inbox.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ViewCheckerInboxComponent', () => {
  let component: ViewCheckerInboxComponent;
  let fixture: ComponentFixture<ViewCheckerInboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCheckerInboxComponent],
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
    fixture = TestBed.createComponent(ViewCheckerInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
