import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFloatingRateComponent } from './view-floating-rate.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

describe('ViewFloatingRateComponent', () => {
  let component: ViewFloatingRateComponent;
  let fixture: ComponentFixture<ViewFloatingRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewFloatingRateComponent],
      imports: [TranslateModule],
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
    fixture = TestBed.createComponent(ViewFloatingRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
