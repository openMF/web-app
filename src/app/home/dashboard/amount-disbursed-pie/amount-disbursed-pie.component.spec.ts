import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountDisbursedPieComponent } from './amount-disbursed-pie.component';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('AmountDisbursedPieComponent', () => {
  let component: AmountDisbursedPieComponent;
  let fixture: ComponentFixture<AmountDisbursedPieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AmountDisbursedPieComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule
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
    fixture = TestBed.createComponent(AmountDisbursedPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
