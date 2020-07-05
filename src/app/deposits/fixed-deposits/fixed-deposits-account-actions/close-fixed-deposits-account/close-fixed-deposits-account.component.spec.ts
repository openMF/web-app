import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseFixedDepositsAccountComponent } from './close-fixed-deposits-account.component';

describe('CloseFixedDepositsAccountComponent', () => {
  let component: CloseFixedDepositsAccountComponent;
  let fixture: ComponentFixture<CloseFixedDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseFixedDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
