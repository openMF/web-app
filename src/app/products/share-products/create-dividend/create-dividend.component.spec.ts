import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDividendComponent } from './create-dividend.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('CreateDividendComponent', () => {
  let component: CreateDividendComponent;
  let fixture: ComponentFixture<CreateDividendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateDividendComponent],
      imports: [
        ReactiveFormsModule,
        CommonModule
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
    fixture = TestBed.createComponent(CreateDividendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
