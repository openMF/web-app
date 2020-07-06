import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFixedDepositAccountComponent } from './create-fixed-deposit-account.component';

describe('CreateFixedDepositAccountComponent', () => {
  let component: CreateFixedDepositAccountComponent;
  let fixture: ComponentFixture<CreateFixedDepositAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateFixedDepositAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFixedDepositAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
