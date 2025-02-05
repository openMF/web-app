import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDividendComponent } from './create-dividend.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('CreateDividendComponent', () => {
  let component: CreateDividendComponent;
  let fixture: ComponentFixture<CreateDividendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateDividendComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        CommonModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        },
        DatePipe

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
