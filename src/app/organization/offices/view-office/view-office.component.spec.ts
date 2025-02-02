import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOfficeComponent } from './view-office.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('ViewOfficeComponent', () => {
  let component: ViewOfficeComponent;
  let fixture: ComponentFixture<ViewOfficeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewOfficeComponent],
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
    fixture = TestBed.createComponent(ViewOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
