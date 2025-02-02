import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverdueChargesTabComponent } from './overdue-charges-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('OverdueChargesTabComponent', () => {
  let component: OverdueChargesTabComponent;
  let fixture: ComponentFixture<OverdueChargesTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OverdueChargesTabComponent],
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
    fixture = TestBed.createComponent(OverdueChargesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
