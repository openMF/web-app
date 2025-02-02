import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialActivityMappingsComponent } from './financial-activity-mappings.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('FinancialActivityMappingsComponent', () => {
  let component: FinancialActivityMappingsComponent;
  let fixture: ComponentFixture<FinancialActivityMappingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FinancialActivityMappingsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinancialActivityMappingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
