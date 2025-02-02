import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRecieptComponent } from './view-reciept.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ViewRecieptComponent', () => {
  let component: ViewRecieptComponent;
  let fixture: ComponentFixture<ViewRecieptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewRecieptComponent],
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
    fixture = TestBed.createComponent(ViewRecieptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
