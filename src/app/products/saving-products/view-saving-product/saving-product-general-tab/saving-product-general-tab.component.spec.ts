import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductGeneralTabComponent } from './saving-product-general-tab.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('SavingProductGeneralTabComponent', () => {
  let component: SavingProductGeneralTabComponent;
  let fixture: ComponentFixture<SavingProductGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavingProductGeneralTabComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
