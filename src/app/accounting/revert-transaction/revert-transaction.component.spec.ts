import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RevertTransactionComponent } from './revert-transaction.component';

describe('RevertTransactionComponent', () => {
  let component: RevertTransactionComponent;
  let fixture: ComponentFixture<RevertTransactionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RevertTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevertTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
