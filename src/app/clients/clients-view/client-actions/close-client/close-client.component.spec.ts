import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseClientComponent } from './close-client.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('CloseClientComponent', () => {
  let component: CloseClientComponent;
  let fixture: ComponentFixture<CloseClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CloseClientComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [
        DatePipe,
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
    fixture = TestBed.createComponent(CloseClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
