import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGlimAccountComponent } from './create-glim-account.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('CreateGlimAccountComponent', () => {
  let component: CreateGlimAccountComponent;
  let fixture: ComponentFixture<CreateGlimAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateGlimAccountComponent],
      imports: [
        HttpClientModule,
        CommonModule
      ],
      providers: [
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGlimAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
