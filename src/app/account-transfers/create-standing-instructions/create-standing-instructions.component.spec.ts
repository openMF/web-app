import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStandingInstructionsComponent } from './create-standing-instructions.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

describe('CreateStandingInstructionsComponent', () => {
  let component: CreateStandingInstructionsComponent;
  let fixture: ComponentFixture<CreateStandingInstructionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateStandingInstructionsComponent],
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
    fixture = TestBed.createComponent(CreateStandingInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
