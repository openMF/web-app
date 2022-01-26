import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BulkLoanReassignmnetComponent } from './bulk-loan-reassignmnet.component';

describe('BulkLoanReassignmnetComponent', () => {
  let component: BulkLoanReassignmnetComponent;
  let fixture: ComponentFixture<BulkLoanReassignmnetComponent>;

  beforeEach(waitForAsync(() => {
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
