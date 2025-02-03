import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkLoanReassignmnetComponent } from './bulk-loan-reassignmnet.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('BulkLoanReassignmnetComponent', () => {
  let component: BulkLoanReassignmnetComponent;
  let fixture: ComponentFixture<BulkLoanReassignmnetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BulkLoanReassignmnetComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        CommonModule
      ],
      providers: [DatePipe]
    }).compileComponents();
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
