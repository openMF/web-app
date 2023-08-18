import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableTransactionTabComponent } from './datatable-transaction-tab.component';

describe('DatatableTransactionTabComponent', () => {
  let component: DatatableTransactionTabComponent;
  let fixture: ComponentFixture<DatatableTransactionTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatatableTransactionTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableTransactionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
