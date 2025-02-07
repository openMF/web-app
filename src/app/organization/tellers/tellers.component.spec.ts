import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TellersComponent } from './tellers.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('TellersComponent', () => {
  let component: TellersComponent;
  let fixture: ComponentFixture<TellersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TellersComponent],
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
    fixture = TestBed.createComponent(TellersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
