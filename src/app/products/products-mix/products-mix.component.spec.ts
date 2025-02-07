import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsMixComponent } from './products-mix.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProductsMixComponent', () => {
  let component: ProductsMixComponent;
  let fixture: ComponentFixture<ProductsMixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProductsMixComponent],
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

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
    fixture = TestBed.createComponent(ProductsMixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
