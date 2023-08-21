import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkRepaymentDownloadComponent } from './bulk-repayment-download.component';

describe('BulkRepaymentDownloadComponent', () => {
  let component: BulkRepaymentDownloadComponent;
  let fixture: ComponentFixture<BulkRepaymentDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkRepaymentDownloadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkRepaymentDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
