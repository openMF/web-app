import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsTabComponent } from './transactions-tab.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('TransactionsTabComponent', () => {
  let component: TransactionsTabComponent;
  let fixture: ComponentFixture<TransactionsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransactionsTabComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
