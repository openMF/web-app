import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsDocumentsTabComponent } from './savings-documents-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('SavingsDocumentsTabComponent', () => {
  let component: SavingsDocumentsTabComponent;
  let fixture: ComponentFixture<SavingsDocumentsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavingsDocumentsTabComponent],
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
    fixture = TestBed.createComponent(SavingsDocumentsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
