import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTransactionsComponent } from './list-transactions.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ListTransactionsComponent', () => {
  let component: ListTransactionsComponent;
  let fixture: ComponentFixture<ListTransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListTransactionsComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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
