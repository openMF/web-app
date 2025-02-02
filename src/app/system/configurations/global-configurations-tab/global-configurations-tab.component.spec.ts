import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalConfigurationsTabComponent } from './global-configurations-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('GlobalConfigurationsTabComponent', () => {
  let component: GlobalConfigurationsTabComponent;
  let fixture: ComponentFixture<GlobalConfigurationsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlobalConfigurationsTabComponent],
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
    fixture = TestBed.createComponent(GlobalConfigurationsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
