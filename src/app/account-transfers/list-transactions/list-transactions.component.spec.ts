import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListTransactionsComponent } from './list-transactions.component';

describe('ListTransactionsComponent', () => {
  let component: ListTransactionsComponent;
  let fixture: ComponentFixture<ListTransactionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
