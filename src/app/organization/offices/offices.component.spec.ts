import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficesComponent } from './offices.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('OfficesComponent', () => {
  let component: OfficesComponent;
  let fixture: ComponentFixture<OfficesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OfficesComponent],
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
    fixture = TestBed.createComponent(OfficesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
