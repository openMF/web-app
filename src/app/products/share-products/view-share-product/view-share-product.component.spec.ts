import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShareProductComponent } from './view-share-product.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('ViewShareProductComponent', () => {
  let component: ViewShareProductComponent;
  let fixture: ComponentFixture<ViewShareProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewShareProductComponent],
      imports: [
        RouterTestingModule,
        TranslateModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ shareProductDatatables: 'Lorem lipsum in de lorem' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewShareProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
