import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrenciesComponent } from './currencies.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { OverlayModule } from '@angular/cdk/overlay';

describe('CurrenciesComponent', () => {
  let component: CurrenciesComponent;
  let fixture: ComponentFixture<CurrenciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CurrenciesComponent],
      imports: [
        OverlayModule
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
    fixture = TestBed.createComponent(CurrenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
