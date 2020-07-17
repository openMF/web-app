import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDocumentsTabComponent } from './loan-documents-tab.component';

describe('LoanDocumentsTabComponent', () => {
  let component: LoanDocumentsTabComponent;
  let fixture: ComponentFixture<LoanDocumentsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanDocumentsTabComponent ]
    })
    .compileComponents();
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
