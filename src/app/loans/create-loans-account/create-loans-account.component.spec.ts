import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLoansAccountComponent } from './create-loans-account.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

describe('CreateLoansAccountComponent', () => {
  let component: CreateLoansAccountComponent;
  let fixture: ComponentFixture<CreateLoansAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateLoansAccountComponent],
      imports: [
        HttpClientModule,
        CommonModule
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
    fixture = TestBed.createComponent(CreateLoansAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
