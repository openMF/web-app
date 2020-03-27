import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFixedDepositComponent } from './new-fixed-deposit.component';

describe('NewFixedDepositComponent', () => {
  let component: NewFixedDepositComponent;
  let fixture: ComponentFixture<NewFixedDepositComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewFixedDepositComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFixedDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
