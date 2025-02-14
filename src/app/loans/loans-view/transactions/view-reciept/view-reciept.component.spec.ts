import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRecieptComponent } from './view-reciept.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewRecieptComponent', () => {
  let component: ViewRecieptComponent;
  let fixture: ComponentFixture<ViewRecieptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewRecieptComponent],
      imports: [RouterTestingModule],
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
    fixture = TestBed.createComponent(ViewRecieptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
