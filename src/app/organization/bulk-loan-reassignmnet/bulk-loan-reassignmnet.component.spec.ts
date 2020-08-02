import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkLoanReassignmnetComponent } from './bulk-loan-reassignmnet.component';

describe('BulkLoanReassignmnetComponent', () => {
  let component: BulkLoanReassignmnetComponent;
  let fixture: ComponentFixture<BulkLoanReassignmnetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkLoanReassignmnetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkLoanReassignmnetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
