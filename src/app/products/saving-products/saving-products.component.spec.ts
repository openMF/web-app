import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductsComponent } from './saving-products.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayModule } from '@angular/cdk/overlay';

describe('SavingProductsComponent', () => {
  let component: SavingProductsComponent;
  let fixture: ComponentFixture<SavingProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingProductsComponent],
      imports: [
        RouterTestingModule,
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
    fixture = TestBed.createComponent(SavingProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
