import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCodeComponent } from './view-code.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewCodeComponent', () => {
  let component: ViewCodeComponent;
  let fixture: ComponentFixture<ViewCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCodeComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
