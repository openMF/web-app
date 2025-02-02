import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoDisbursalComponent } from './undo-disbursal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

describe('UndoDisbursalComponent', () => {
  let component: UndoDisbursalComponent;
  let fixture: ComponentFixture<UndoDisbursalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UndoDisbursalComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
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
    fixture = TestBed.createComponent(UndoDisbursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
