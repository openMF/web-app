import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDocumentsTabComponent } from './loan-documents-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

describe('LoanDocumentsTabComponent', () => {
  let component: LoanDocumentsTabComponent;
  let fixture: ComponentFixture<LoanDocumentsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoanDocumentsTabComponent],
      imports: [HttpClientModule],
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
    fixture = TestBed.createComponent(LoanDocumentsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
